'use client';

import { getAQIForecast, AQIForecastPoint, AQIForecastResult } from '@/app/actions';
import MinLoader from '@/components/MinLoader';
import { LocationDataType } from '@/lib/types';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useState, useTransition } from 'react';

const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), {
    ssr: false,
});
const LineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), {
    ssr: false,
});
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), {
    ssr: false,
});
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), {
    ssr: false,
});
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), {
    ssr: false,
});
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), {
    ssr: false,
});
const Line = dynamic(() => import('recharts').then((mod) => mod.Line), {
    ssr: false,
});

interface Props {
    data: LocationDataType;
}

type ForecastChartPoint = AQIForecastPoint & {
    confidencePct: number;
};

const tooltipFormatter = (value: string | number, name: string | number) => {
    const numericValue = typeof value === 'number' ? value : Number(value ?? 0);

    if (name === 'confidencePct') {
        return [`${Math.round(numericValue)}%`, 'Confiance'];
    }

    return [Math.round(numericValue), 'AQI'];
};

const tooltipLabelFormatter = (_: unknown, payload: unknown) => {
    const points = payload as Array<{ payload?: ForecastChartPoint }> | undefined;

    if (!points?.length) {
        return '';
    }

    const iso = points[0]?.payload?.isoTimestamp;
    return iso ? new Date(iso).toLocaleString('fr-FR') : '';
};

const PredictedTrend = ({ data }: Props) => {
    const [forecast, setForecast] = useState<AQIForecastResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const [lat, lng] = data.coordinates;
    const coordsKey = `${lat},${lng}`;

    useEffect(() => {
        setError(null);
        startTransition(() => {
            setForecast(null);
            getAQIForecast([lat, lng], 24)
                .then(setForecast)
                .catch((err) => {
                    console.error('Failed to fetch AQI forecast', err);
                    setError("Impossible de récupérer la prévision AQI.");
                });
        });
    }, [coordsKey, lat, lng]);

    const chartData: ForecastChartPoint[] = useMemo(() => {
        if (!forecast?.points?.length) {
            return [];
        }

        return forecast.points.map((point: AQIForecastPoint) => ({
            ...point,
            confidencePct: Math.round(point.confidence * 100),
        }));
    }, [forecast]);

    const aqiDomain = useMemo<[number, number]>(() => {
        if (!chartData.length) {
            return [0, 250];
        }

        const values = chartData.map((point) => point.aqi);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const padding = Math.max(10, Math.round((maxValue - minValue) * 0.15));

        return [Math.max(0, minValue - padding), Math.min(500, maxValue + padding)];
    }, [chartData]);

    const summary = useMemo(() => {
        if (!chartData.length) {
            return null;
        }

        let minPoint = chartData[0];
        let maxPoint = chartData[0];
        let confidenceTotal = 0;

        chartData.forEach((point) => {
            if (point.aqi < minPoint.aqi) {
                minPoint = point;
            }
            if (point.aqi > maxPoint.aqi) {
                maxPoint = point;
            }
            confidenceTotal += point.confidencePct;
        });

        const averageConfidence = Math.round(confidenceTotal / chartData.length);

        return {
            nextPoint: chartData[0],
            lastPoint: chartData[chartData.length - 1],
            minPoint,
            maxPoint,
            averageConfidence,
        };
    }, [chartData]);

    const formatHour = (isoTimestamp: string) =>
        new Date(isoTimestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return (
        <section className="flex items-center justify-center w-full px-1 md:px-8">
            <div className="p-2 bg-white dark:bg-zinc-900 w-full rounded-3xl shadow-2xl my-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full p-4">
                    <div>
                        <h2 className="text-xl font-semibold">24h AQI Forecast — {data.name}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Measured ({lat.toFixed(4)}, {lng.toFixed(4)}). Updated at 
                            {forecast?.generatedAt ? new Date(forecast.generatedAt).toLocaleString('fr-FR') : '…'}.
                        </p>
                    </div>

                    {summary && (
                        <div className="grid w-full md:w-auto grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 px-4 py-3">
                                <p className="text-xs font-semibold uppercase text-blue-500 dark:text-blue-400">Prochaine heure</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{summary.nextPoint.aqi}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    à {formatHour(summary.nextPoint.isoTimestamp)} · {summary.nextPoint.confidencePct}% confiance
                                </p>
                            </div>
                            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3">
                                <p className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">AQI minimum</p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{summary.minPoint.aqi}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">à {formatHour(summary.minPoint.isoTimestamp)}</p>
                            </div>
                            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/30 px-4 py-3">
                                <p className="text-xs font-semibold uppercase text-rose-500 dark:text-rose-400">AQI maximum</p>
                                <p className="text-2xl font-bold text-rose-600 dark:text-rose-300">{summary.maxPoint.aqi}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatHour(summary.maxPoint.isoTimestamp)} · confiance moyenne {summary.averageConfidence}%
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="rounded-xl w-full h-[420px] bg-gray-200 dark:bg-zinc-800 rounded-b-3xl">
                    {error && (
                        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    {!error && (isPending || !chartData.length) && (
                        <div className="flex h-full flex-col items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <MinLoader />
                            <span>Loading…</span>
                        </div>
                    )}

                    {!error && !isPending && chartData.length > 0 && (
                        <ResponsiveContainer width="100%" height={360}>
                            <LineChart data={chartData} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" opacity={0.5} />
                                <XAxis dataKey="time" tick={{ fontSize: 12 }} interval={2} />
                                <YAxis
                                    yAxisId="left"
                                    domain={aqiDomain}
                                    tick={{ fontSize: 12 }}
                                    label={{ value: 'AQI', angle: -90, position: 'insideLeft' }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    domain={[0, 100]}
                                    tickFormatter={(value: number) => `${Math.round(value)}%`}
                                    tick={{ fontSize: 12 }}
                                    label={{ value: 'Confiance', angle: 90, position: 'insideRight' }}
                                />
                                <Tooltip
                                    formatter={tooltipFormatter as any}
                                    labelFormatter={tooltipLabelFormatter as any}
                                    contentStyle={{ fontSize: '0.85rem' }}
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="aqi"
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                    name="AQI prévu"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="confidencePct"
                                    stroke="#f97316"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    name="Confiance"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </section>
    );
};

export default PredictedTrend;
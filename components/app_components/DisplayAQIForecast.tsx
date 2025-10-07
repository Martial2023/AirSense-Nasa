'use client'
import { AQIForecastPoint, AQIForecastResult, LocationDataType } from '@/lib/types'
import React, { useEffect, useMemo, useState, useTransition } from 'react'
import MinLoader from '../MinLoader'
import dynamic from 'next/dynamic'
import { getAQIForecast } from '@/app/(actions)/actions'

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false })

type Props = {
    data: LocationDataType
}

type ForecastChartPoint = AQIForecastPoint & {
    confidencePct: number
}

const tooltipFormatter = (value: string | number, name: string | number) => {
    const numericValue = typeof value === 'number' ? value : Number(value ?? 0)
    return name === 'confidencePct' ? [`${Math.round(numericValue)}%`, 'Confiance'] : [Math.round(numericValue), 'AQI']
}

const tooltipLabelFormatter = (_: unknown, payload: unknown) => {
    const points = payload as Array<{ payload?: ForecastChartPoint }> | undefined
    if (!points?.length) return ''
    const iso = points[0]?.payload?.isoTimestamp
    return iso ? new Date(iso).toLocaleString('fr-FR') : ''
}

const DisplayAQIForecast = ({ data }: Props) => {
    const [forecast, setForecast] = useState<AQIForecastResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()


    const [lat, lng] = data?.coordinates || []
    const coordsKey = `${lat},${lng}`

    useEffect(() => {
        setError(null)
        startTransition(() => {
            setForecast(null)
            getAQIForecast([lat, lng], 24)
                .then(result => {
                    result.error ? setError(result.error) : setError(null)
                    setForecast(result.data)
                })
                .catch(err => {
                    console.error('Failed to fetch AQI forecast', err)
                    setError("Impossible de récupérer les prévisions AQI.")
                    setForecast(null)
                })
        })
    }, [coordsKey, lat, lng])

    const chartData: ForecastChartPoint[] = useMemo(() => {
        return forecast?.points?.map(p => ({
            ...p,
            confidencePct: Math.round(p.confidence * 100)
        })) || []
    }, [forecast])

    const aqiDomain = useMemo<[number, number]>(() => {
        if (!chartData.length) return [0, 250]
        const values = chartData.map(p => p.aqi)
        const minValue = Math.min(...values)
        const maxValue = Math.max(...values)
        const padding = Math.max(10, Math.round((maxValue - minValue) * 0.15))
        return [Math.max(0, minValue - padding), Math.min(500, maxValue + padding)]
    }, [chartData])

    const summary = useMemo(() => {
        if (!chartData.length) return null
        let minPoint = chartData[0]
        let maxPoint = chartData[0]
        let confidenceTotal = 0

        chartData.forEach(p => {
            if (p.aqi < minPoint.aqi) minPoint = p
            if (p.aqi > maxPoint.aqi) maxPoint = p
            confidenceTotal += p.confidencePct
        })

        return {
            nextPoint: chartData[0],
            lastPoint: chartData[chartData.length - 1],
            minPoint,
            maxPoint,
            averageConfidence: Math.round(confidenceTotal / chartData.length)
        }
    }, [chartData])

    const formatHour = (isoTimestamp: string) =>
        new Date(isoTimestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

    return (
        <div className="col-span-1 md:col-span-7 w-full bg-white dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl p-6 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-500 flex flex-col gap-6 border border-zinc-200/20 dark:border-zinc-700/30">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">🌤️Air Quality Forecast </h2>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                    Last updated : {data?.lastUpdated}
                </span>
            </div>

            {/* SUMMARY CARDS */}
            {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/40 dark:from-blue-900/30 dark:to-blue-800/20 p-4 shadow-sm hover:shadow-md transition-all duration-300">
                        <p className="text-xs font-semibold uppercase text-blue-600 dark:text-blue-400">Prochaine heure</p>
                        <p className="text-3xl font-bold mt-1 text-blue-700 dark:text-blue-300">{summary.nextPoint.aqi}</p>
                        <p className="text-xs mt-1 text-zinc-600 dark:text-zinc-400">
                            à {formatHour(summary.nextPoint.isoTimestamp)} · {summary.nextPoint.confidencePct}% confiance
                        </p>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/40 dark:from-emerald-900/30 dark:to-emerald-800/20 p-4 shadow-sm hover:shadow-md transition-all duration-300">
                        <p className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">AQI minimum</p>
                        <p className="text-3xl font-bold mt-1 text-emerald-700 dark:text-emerald-300">{summary.minPoint.aqi}</p>
                        <p className="text-xs mt-1 text-zinc-600 dark:text-zinc-400">à {formatHour(summary.minPoint.isoTimestamp)}</p>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/40 dark:from-rose-900/30 dark:to-rose-800/20 p-4 shadow-sm hover:shadow-md transition-all duration-300">
                        <p className="text-xs font-semibold uppercase text-rose-600 dark:text-rose-400">AQI maximum</p>
                        <p className="text-3xl font-bold mt-1 text-rose-700 dark:text-rose-300">{summary.maxPoint.aqi}</p>
                        <p className="text-xs mt-1 text-zinc-600 dark:text-zinc-400">
                            {formatHour(summary.maxPoint.isoTimestamp)} · confiance moyenne {summary.averageConfidence}%
                        </p>
                    </div>
                </div>
            )}

            {/* GRAPH */}
            <div className="rounded-2xl w-full h-[380px] bg-zinc-100 dark:bg-zinc-800 p-4 border border-zinc-200/20 dark:border-zinc-700/30 shadow-inner">
                {error && (
                    <div className="flex h-full items-center justify-center text-center text-sm text-red-500">{error}</div>
                )}

                {!error && (isPending || !chartData.length) && (
                    <div className="flex h-full flex-col items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <MinLoader />
                        <span>Loading Forecasts…</span>
                    </div>
                )}

                {!error && !isPending && chartData.length > 0 && (
                    <ResponsiveContainer width="100%" height={340}>
                        <LineChart data={chartData} margin={{ left: 6, right: 12, top: 12, bottom: 0 }}>
                            <XAxis dataKey="time" tick={{ fontSize: 12 }} interval={2} />
                            <YAxis
                                yAxisId="left"
                                domain={aqiDomain}
                                tick={{ fontSize: 10 }}
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
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    borderRadius: '0.75rem',
                                    color: '#f8fafc',
                                    border: 'none',
                                    padding: '0.75rem 1rem',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                }}
                                itemStyle={{ color: '#f8fafc' }}
                                labelStyle={{ color: '#93c5fd', fontWeight: 600 }}
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
    )
}

export default DisplayAQIForecast
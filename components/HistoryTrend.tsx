'use client';

import { getHistoryTrend, HistoryTrendPoint } from '@/app/actions';
import MinLoader from '@/components/MinLoader';
import { LocationDataType } from '@/lib/types';
import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useState, useTransition } from 'react';

// Import dynamique pour éviter les erreurs SSR avec recharts
const AreaChart = dynamic(() => import('recharts').then((mod) => mod.AreaChart), {
    ssr: false,
});
const Area = dynamic(() => import('recharts').then((mod) => mod.Area), {
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
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), {
    ssr: false,
});

type Props = {
    data: LocationDataType;
};

const HistoryTrend = ({ data }: Props) => {
    const [lat, lng] = data.coordinates;
    const coordsKey = `${lat},${lng}`;

    const [chartData, setChartData] = useState<HistoryTrendPoint[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setError(null);
        startTransition(() => {
            setChartData([]);
            getHistoryTrend([lat, lng])
                .then(setChartData)
                .catch((err) => {
                    console.error('Failed to fetch trend history', err);
                    setError("Impossible de récupérer l'évolution des polluants.");
                });
        });
    }, [coordsKey]);

    const stats = useMemo(() => {
        if (!chartData.length) return null;

        return chartData.reduce(
            (acc, item) => {
                if (item.composite < acc.minComposite.composite) acc.minComposite = item;
                if (item.composite > acc.maxComposite.composite) acc.maxComposite = item;
                acc.o3Total += item.o3;
                return acc;
            },
            {
                minComposite: chartData[0],
                maxComposite: chartData[0],
                o3Total: 0,
            }
        );
    }, [chartData]);

    const averageO3 = stats && Math.round(stats.o3Total / chartData.length);
    const minComposite = stats?.minComposite;
    const maxComposite = stats?.maxComposite;

    return (
        <section className='flex items-center justify-center w-full px-4 md:px-8'>
            <div className='p-2 bg-white dark:bg-zinc-900 w-full rounded-3xl shadow-2xl my-8'>
                <div className='space-y-6 flex items-center justify-between w-full p-4'>
                    <h2 className='text-xl font-semibold border-1 p-1.5 rounded-xl flex items-center gap-1'>
                        <MapPin className="w-4 h-4 text-gray-500" /> {data.name}
                    </h2>

                    <div className='flex items-center gap-2.5'>
                        {minComposite && (
                            <div className='flex items-center gap-1'>
                                <div className='bg-green-500 p-2 rounded-xl min-w-[48px] text-center'>
                                    <span className='text-white font-semibold'>{minComposite.composite}</span>
                                </div>
                                <div>
                                    <p className='text-sm font-semibold'>Indice min.</p>
                                    <p className='text-sm'>le {minComposite.time}</p>
                                </div>
                            </div>
                        )}
                        {maxComposite && (
                            <div className='flex items-center gap-1'>
                                <div className='bg-red-500 p-2 rounded-xl min-w-[48px] text-center'>
                                    <span className='text-white font-semibold'>{maxComposite.composite}</span>
                                </div>
                                <div>
                                    <p className='text-sm font-semibold'>Indice max.</p>
                                    <p className='text-sm'>le {maxComposite.time}</p>
                                </div>
                            </div>
                        )}
                        {averageO3 && (
                            <div className='hidden sm:flex items-center gap-1'>
                                <div className='bg-amber-500 p-2 rounded-xl min-w-[48px] text-center'>
                                    <span className='text-white font-semibold'>{averageO3}</span>
                                </div>
                                <div>
                                    <p className='text-sm font-semibold'>O₃ moyen</p>
                                    <p className='text-sm'>30 derniers jours</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className='rounded-xl w-full h-[400px] bg-gray-200 dark:bg-zinc-800 rounded-b-3xl'>
                    {error && (
                        <div className='flex h-full items-center justify-center px-6 text-center text-sm text-red-500'>
                            {error}
                        </div>
                    )}
                    {!error && (isPending || !chartData.length) && (
                        <div className='flex h-full flex-col items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-300'>
                            <MinLoader />
                            <span>Chargement de la tendance…</span>
                        </div>
                    )}
                    {!error && !isPending && chartData.length > 0 && (
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorno2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="coloro3" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorso2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" interval={3} />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" />
                                <Tooltip />
                                <Area type="monotone" dataKey="no2" stroke="#8884d8" fillOpacity={1} fill="url(#colorno2)" />
                                <Area type="monotone" dataKey="o3" stroke="#82ca9d" fillOpacity={1} fill="url(#coloro3)" />
                                <Area type="monotone" dataKey="so2" stroke="#fbbf24" fillOpacity={0.6} fill="url(#colorso2)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </section>
    )
}

export default HistoryTrend
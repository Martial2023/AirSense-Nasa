'use client';

import { getAQIPassData } from '@/app/(actions)/actions';
import MinLoader from '@/components/MinLoader';
import { AQIHistoryPoint, LocationDataType } from '@/lib/types';
import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });

type Props = {
    data: LocationDataType;
};

const AQIHistory = ({ data }: Props) => {
    const [aqiPassData, setAqiPassData] = useState<AQIHistoryPoint[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    

    const [lat, lng] = data.coordinates;
    const coordsKey = `${lat},${lng}`;

    

    useEffect(() => {
        setError(null);
        startTransition(() => {
            setAqiPassData([]);
            getAQIPassData([lat, lng])
                .then(setAqiPassData)
                .catch((err) => {
                    console.error('Failed to fetch AQI history', err);
                    setError("Failed to load AQI history data");
                });
        });
    }, [coordsKey, lat, lng]);

    const summary = useMemo(() => {
        if (!aqiPassData.length) return null;

        return aqiPassData.reduce(
            (acc, item) => {
                if (item.aqi < acc.min.aqi) acc.min = item;
                if (item.aqi > acc.max.aqi) acc.max = item;
                acc.total += item.aqi;
                return acc;
            },
            { min: aqiPassData[0], max: aqiPassData[0], total: 0 }
        );
    }, [aqiPassData]);

    const averageAQI = summary && Math.round(summary.total / aqiPassData.length);
    const minEntry = summary?.min;
    const maxEntry = summary?.max;

    return (
        <section className='flex items-center justify-center w-full px-2'>
            <div className='w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden my-8 transition-all duration-300'>

                <div className='flex flex-col md:flex-row items-start md:items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800'>
                    <div>
                        <h2 className='text-2xl font-bold text-gray-800 dark:text-white'>Air Quality History</h2>
                        <div className='flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1'>
                            <MapPin className='w-4 h-4' />
                            <span>{data.name}</span>
                        </div>
                    </div>

                    <div className='flex items-center gap-4 mt-4 md:mt-0'>
                        {minEntry && (
                            <div className='flex items-center gap-2 bg-green-500/10 px-3 py-2 rounded-xl'>
                                <div className='bg-green-500 px-3 py-2 rounded-lg text-white font-bold'>{minEntry.aqi}</div>
                                <div>
                                    <p className='text-sm font-semibold text-gray-700 dark:text-gray-200'>Min</p>
                                    <p className='text-xs text-gray-500 dark:text-gray-400'>{minEntry.time}</p>
                                </div>
                            </div>
                        )}
                        {maxEntry && (
                            <div className='flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-xl'>
                                <div className='bg-red-500 px-3 py-2 rounded-lg text-white font-bold'>{maxEntry.aqi}</div>
                                <div>
                                    <p className='text-sm font-semibold text-gray-700 dark:text-gray-200'>Max</p>
                                    <p className='text-xs text-gray-500 dark:text-gray-400'>{maxEntry.time}</p>
                                </div>
                            </div>
                        )}
                        {averageAQI && (
                            <div className='hidden sm:flex items-center gap-2 bg-amber-500/10 px-3 py-2 rounded-xl'>
                                <div className='bg-amber-500 px-3 py-2 rounded-lg text-white font-bold'>{averageAQI}</div>
                                <div>
                                    <p className='text-sm font-semibold text-gray-700 dark:text-gray-200'>Avg</p>
                                    <p className='text-xs text-gray-500 dark:text-gray-400'>30 last days</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 📊 Chart Section */}
                <div className='w-full h-[400px] bg-gray-100 dark:bg-zinc-800 px-4 py-6 rounded-b-3xl relative'>
                    {error && (
                        <div className='flex h-full items-center justify-center text-sm text-red-500'>{error}</div>
                    )}
                    {!error && (isPending || !aqiPassData.length) && (
                        <div className='flex h-full flex-col items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-300'>
                            <MinLoader />
                            <span>Loading…</span>
                        </div>
                    )}
                    {!error && !isPending && aqiPassData.length > 0 && (
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={aqiPassData} barCategoryGap='25%'>
                                {/* <CartesianGrid strokeDasharray='3 3' stroke='#4b5563' opacity={0.2} /> */}
                                <XAxis dataKey='time' interval={3} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        color: '#f9fafb',
                                        borderRadius: '8px',
                                        border: 'none',
                                    }}
                                />
                                <Bar dataKey='aqi' radius={[8, 8, 0, 0]} fill='#fbbf24' />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </section>
    );
};

export default AQIHistory;
'use client';

import { getAQIPassData, AQIHistoryPoint } from '@/app/actions';
import MinLoader from '@/components/MinLoader';
import { LocationDataType } from '@/lib/types';
import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

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

type Props = {
    data: LocationDataType;
};

const AQIHistory = ({ data }: Props) => {
    const locationCoords = data.coordinates;
    const [lat, lng] = locationCoords;
    const coordsKey = `${lat},${lng}`;

    const [aqiPassData, setAqiPassData] = useState<AQIHistoryPoint[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setError(null);
        startTransition(() => {
            setAqiPassData([]);
            getAQIPassData([lat, lng])
                .then(setAqiPassData)
                .catch((err) => {
                    console.error('Failed to fetch AQI history', err);
                    setError("Impossible de récupérer l'historique AQI.");
                });
        });
    }, [coordsKey]);

    const summary = useMemo(() => {
        if (!aqiPassData.length) {
            return null;
        }

        return aqiPassData.reduce(
            (acc, item) => {
                if (item.aqi < acc.min.aqi) acc.min = item;
                if (item.aqi > acc.max.aqi) acc.max = item;
                acc.total += item.aqi;
                return acc;
            },
            {
                min: aqiPassData[0],
                max: aqiPassData[0],
                total: 0,
            }
        );
    }, [aqiPassData]);

    const averageAQI = summary && Math.round(summary.total / aqiPassData.length);
    const minEntry = summary?.min;
    const maxEntry = summary?.max;

    return (
        <section className='flex items-center justify-center w-full px-1 md:px-8'>
            <div className='p-2 bg-white dark:bg-zinc-900 w-full rounded-3xl shadow-2xl my-8'>
                <div className='space-y-6 flex items-center justify-between w-full p-4'>
                    <div className='flex flex-col'>
                        <h2 className='text-2xl font-bold'>Air Quality History</h2>
                        <div className='flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400'>
                            <MapPin className='w-4 h-4' />
                            <span>{data.name}</span>
                        </div>
                    </div>

                    <div className='flex items-center gap-2.5'>
                        {minEntry && (
                            <div className='flex items-center gap-1'>
                                <div className='bg-green-500 p-2 rounded-xl min-w-[48px] text-center'>
                                    <span className='text-white font-semibold'>{minEntry.aqi}</span>
                                </div>
                                <div>
                                    <p className='text-sm font-semibold'>Min.</p>
                                    <p className='text-sm'>le {minEntry.time}</p>
                                </div>
                            </div>
                        )}
                        {maxEntry && (
                            <div className='flex items-center gap-1'>
                                <div className='bg-red-500 p-2 rounded-xl min-w-[48px] text-center'>
                                    <span className='text-white font-semibold'>{maxEntry.aqi}</span>
                                </div>
                                <div>
                                    <p className='text-sm font-semibold'>Max.</p>
                                    <p className='text-sm'>le {maxEntry.time}</p>
                                </div>
                            </div>
                        )}
                        {averageAQI && (
                            <div className='hidden sm:flex items-center gap-1'>
                                <div className='bg-amber-500 p-2 rounded-xl min-w-[48px] text-center'>
                                    <span className='text-white font-semibold'>{averageAQI}</span>
                                </div>
                                <div>
                                    <p className='text-sm font-semibold'>Moy.</p>
                                    <p className='text-sm'>30 last days</p>
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
                    {!error && (isPending || !aqiPassData.length) && (
                        <div className='flex h-full flex-col items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-300'>
                            <MinLoader />
                            <span>Loading…</span>
                        </div>
                    )}
                    {!error && !isPending && aqiPassData.length > 0 && (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={aqiPassData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" interval={3} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="aqi" fill="#fbbf24" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </section>
    )
}

export default AQIHistory
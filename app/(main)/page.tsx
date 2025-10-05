'use client';

import AQIChat from '@/components/AQIChat'
import AQIInfoSection from '@/components/AQIInfoSection'
import HistoryTrend from '@/components/HistoryTrend'
import { LocationDataType } from '@/lib/types'
import React from 'react'
// import ShowLocationMap from '@/components/components/ShowLocationMap';
import AirComposite from '@/components/components/AirComposite';
import AQIHistory from '@/components/components/AQIHistory';
import dynamic from "next/dynamic";
import PredictedTrend from '@/components/components/PredictedTrend';

const ShowLocationMap = dynamic(() => import('@/components/components/ShowLocationMap'), { ssr: false });

const page = () => {
    const realLocationData: LocationDataType = {
        name: "Cotonou, Littoral, Benin",
        coordinates: [6.3665, 2.4185], // Coordonnées de Cotonou
        aqi: 55,
        pm25: 22,
        pm10: 26,
        no2: 15,
        o3: 45,
        so2: 8,
        co: 0.5,
        temperature: 2,
        humidity: 79,
        windSpeed: 12,
        windDirection: "SW",
        pressure: 1013,
        visibility: 10,
        lastUpdated: "4 minutes ago"
    }
    return (
        <main className='min-h-screen px-2 md:px-4'>
            <ShowLocationMap
                data={realLocationData}
            />

            {/* <CurrentAQIInfoLocation
                    data={realLocationData}
                />> */}

            <AQIInfoSection
                locationData={realLocationData}
            />

            <AirComposite
                data={realLocationData}
            />

            <HistoryTrend
                data={realLocationData}
            />

            <PredictedTrend
                data={realLocationData}
            />

            <AQIHistory
                data={realLocationData}
            />


            {/* <HistoryTrend /> */}
            <AQIChat
                data={realLocationData}
            />
        </main>
    )
}

export default page
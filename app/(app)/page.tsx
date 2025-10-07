'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { useSearch } from './context/SearchContext'
import { LocationDataType } from '@/lib/types'
import { toast } from 'sonner'
import { getFullLocationData } from '../(actions)/actions'
import AQIChat from '@/components/AQIChat'
import DisplayAQI from '@/components/app_components/DisplayAQI'
import DisplayAQIForecast from '@/components/app_components/DisplayAQIForecast'
import AITipsForUser from '@/components/app_components/AITipsForUser'
import AirComposite from '@/components/app_components/AirComposite'
import AQIHistory from '@/components/app_components/AQIHistory'
import MinLoader from '@/components/MinLoader'
import dynamic from 'next/dynamic'
const MapComponent = dynamic(
  () => import('@/components/app_components/MapComponent'),
  { ssr: false }
)

const getStatus = (aqi: number) => {
    if (aqi <= 50) return "Good"
    if (aqi <= 100) return "Moderate"
    if (aqi <= 150) return "Unhealthy for Sensitive Groups"
    if (aqi <= 200) return "Unhealthy"
    if (aqi <= 300) return "Very Unhealthy"
    return "Hazardous"
}

const Page = () => {
    const { search, setSearch } = useSearch()
    const [locationFullData, setLocationFullData] = useState<LocationDataType>()
    const [coordinates, setCoordinates] = useState<[number, number]>()
    const [isDataFetching, setIsDataFetching] = useState<boolean>(false)

    const fetchFullLocationData = async () => {
        try {
            setIsDataFetching(true)
            const response = await getFullLocationData({
                lat: coordinates ? coordinates[0] : 45.5019,
                lon: coordinates ? coordinates[1] : -73.5674,
            })
            setLocationFullData(response)
        } catch {
            toast.error("Erreur lors de la récupération des données")
        } finally {
            setIsDataFetching(false)
        }
    }

    useEffect(() => {
        fetchFullLocationData()
    }, [coordinates, search, fetchFullLocationData])

    useEffect(() => {
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    setCoordinates([latitude, longitude])
                    //   setLocationFullData({...locationFullData, coordinates: [latitude, longitude]})
                },
                () => {
                    toast.warning("Impossible to get your location, using default location (Montreal). Please allow location access and refresh the page.")
                    setCoordinates([45.5019, -73.5674]) // Montréal
                },
                { timeout: 8000 }
            )
        } else {
            setCoordinates([45.5019, -73.5674])
        }
    }, [navigator.geolocation])


    const handleLocationSelected = useCallback(
        (coords: [number, number]) => {
            const [lat, lng] = coords
            setCoordinates([lat, lng])
        },
        []
    )

    return (
        <main className="min-h-screen">
            <MapComponent
                isDataFetching={isDataFetching}
                data={locationFullData}
                onLocationSelected={handleLocationSelected}
                search={search}
                setSearch={setSearch}
            />

            <section className='w-full grid grid-cols-1 md:grid-cols-10 my-2 p-2 gap-2'>
                <DisplayAQI data={{
                    city: locationFullData?.name,
                    country: locationFullData?.name,
                    aqi: locationFullData?.aqi,
                    status: getStatus(locationFullData?.aqi || 0)
                }}
                    isLoading={isDataFetching} />

                <AITipsForUser
                    data={locationFullData}
                    isLoading={isDataFetching}
                />

            </section>

            <div className='w-full p-2'>
                <AirComposite
                    data={locationFullData}
                    loading={isDataFetching}
                />
            </div>

            <div className='w-full p-2'>
                {
                    isDataFetching ? (
                        <div className='flex h-64 w-full flex-col items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-300'>
                            <MinLoader />
                            <span>Loading…</span>
                        </div>
                    ) : (
                        locationFullData && (
                            <DisplayAQIForecast
                                data={locationFullData}
                            />
                        )
                    )
                }
            </div>

            <div className='w-full p-2'>
                {
                    locationFullData && (
                        <AQIHistory
                            data={locationFullData}
                        />
                    )
                }
            </div>

            {
                locationFullData && <AQIChat data={locationFullData} />
            }
        </main>
    )
}

export default Page

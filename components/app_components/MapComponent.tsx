'use client'
import React, { useEffect, useState } from 'react'
import { Input } from '../ui/input';
import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { LocationDataType } from '@/lib/types'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet';
import MinLoader from '../MinLoader';


// 📍 Définir les couleurs AQI dynamiquement
const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-500'
    if (aqi <= 100) return 'bg-amber-500'
    if (aqi <= 150) return 'bg-orange-500'
    if (aqi <= 200) return 'bg-red-500'
    if (aqi <= 300) return 'bg-purple-500'
    return 'bg-red-900'
}

const createAqiIcon = (aqi: number) => {
    const color = getAqiColor(aqi)
    return L.divIcon({
        className: '',
        html: `<div class="flex items-center justify-center w-12 h-12 text-white font-bold rounded-full shadow-lg ${color}">${aqi}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -35],
    })
}

const MapPositionUpdater = ({ position }: { position: [number, number] }) => {
    const map = useMap()

    useEffect(() => {
        map.setView(position, map.getZoom())
    }, [map, position])

    return null
}

const LocationClickHandler = ({ onSelect }: { onSelect?: (coords: [number, number]) => void }) => {
    useMapEvents({
        click(event) {
            if (onSelect) {
                onSelect([event.latlng.lat, event.latlng.lng])
            }
        },
    })

    return null
}

type Props = {
    isDataFetching: boolean
    data: LocationDataType | undefined;
    onLocationSelected?: (coords: [number, number]) => void
    search: string;
    setSearch: (search: string) => void;
}
const MapComponent = ({ data, onLocationSelected, search, setSearch }: Props) => {
    const [openSearch, setOpenSearch] = useState<boolean>(false)
    const position: [number, number] | undefined = data?.coordinates

    return (
        <section className='h-[60vh] w-full bg-gray-100 dark:bg-zinc-800  relative'>
            <div className="z-2 mx-6 hidden flex-1 md:flex absolute top-4 right-6 w-1/3">
                <div className="relative flex w-full items-center justify-end overflow-hidden">
                    <Input
                        type="text"
                        placeholder="Search any location, city, state or country"
                        className={`w-full origin-right rounded-full bg-zinc-100 pl-4 pr-10 text-sm shadow-sm transition-all duration-300 ease-in-out focus-visible:ring-1 focus-visible:ring-blue-500 dark:bg-zinc-800 md:ml-auto
                            ${openSearch ? "md:w-full md:opacity-100" : "md:w-0 md:min-w-0 md:opacity-0 md:pl-0 md:pr-0 md:pointer-events-none"}
                            `}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button
                        className="w-8 h-8 text-white rounded-full absolute right-3 top-1/2 -translate-y-1/2 transition"
                        aria-label="Search"
                        size={"icon"}
                        onClick={() => setOpenSearch(!openSearch)}
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {
                data && position ? (
                    <MapContainer
                        center={position}
                        zoom={11}
                        scrollWheelZoom={true}
                        style={{ width: '100%', height: '100%' }}
                        className="z-0"
                    >
                        <MapPositionUpdater position={position} />
                        <LocationClickHandler onSelect={onLocationSelected} />
                        {/* 🗺️ Fond de carte (ici OpenStreetMap libre et gratuit) */}
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* 📍 Marqueur dynamique */}
                        <Marker position={position} icon={createAqiIcon(data.aqi)}>
                            <Popup>
                                <div className="text-sm">
                                    <p><strong>{data.name}</strong></p>
                                    <p>AQI: {data.aqi}</p>
                                    <p>Temperature: {data.temperature}°C</p>
                                    <p>Humidity: {data.humidity}%</p>
                                    <p>Last Updated: {new Date(data.lastUpdated).toLocaleString()}</p>
                                </div>
                            </Popup>
                        </Marker>
                    </MapContainer>
                ): (
                    <div className='h-full w-full flex items-center justify-center'>
                        <MinLoader />
                    </div>
                )
            }
        </section>
    )
}

export default MapComponent
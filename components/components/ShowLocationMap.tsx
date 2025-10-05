'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import React, { useEffect } from 'react'
import { LocationDataType } from '@/lib/types'

// 📍 Définir les couleurs AQI dynamiquement
const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-500'
    if (aqi <= 100) return 'bg-amber-500'
    if (aqi <= 150) return 'bg-orange-500'
    if (aqi <= 200) return 'bg-red-500'
    if (aqi <= 300) return 'bg-purple-500'
    return 'bg-red-900'
}

// 🧪 Créer une icône personnalisée pour afficher l'AQI dans le marqueur
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

type Props = {
    data: LocationDataType
    onLocationSelected?: (coords: [number, number]) => void
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

const ShowLocationMap = ({ data, onLocationSelected }: Props) => {
    const [lat, lng] = data.coordinates
    const position: [number, number] = [lat, lng]

    return (
        <section className='z-1 w-full h-80 md:h-[350px] rounded-b-2xl shadow-md overflow-hidden'>
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
        </section>
    )
}

export default ShowLocationMap

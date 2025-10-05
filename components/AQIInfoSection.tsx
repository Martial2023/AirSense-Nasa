'use client';
import React, { useEffect, useMemo, useState } from 'react'
import type { LocationDataType, NearbyStationsResult } from '@/lib/types';
import { Button } from './ui/button';
import { MapPin, Heart, Share2, BotIcon } from 'lucide-react';
import { getAQILevel } from '@/lib/types';
import { answerUserQuestion } from '@/lib/AIAnalysisFunction';
import MinLoader from './MinLoader';

interface AQIInfoSectionProps {
    locationData: LocationDataType;
    nearby?: NearbyStationsResult | null;
    onLocate?: () => void;
    locating?: boolean;
}

const AQIInfoSection: React.FC<AQIInfoSectionProps> = ({ locationData, nearby, onLocate, locating }) => {
    const aqiLevel = getAQILevel(locationData.aqi);
    const [tips, setTips] = useState<string>("")
    const [loadingTips, setLoadingTips] = useState<boolean>(false)

    // Couleur de fond dynamique basée sur l'AQI
    const getBgGradient = () => {
        if (locationData.aqi <= 50) return 'from-green-100 to-green-300 dark:from-green-800 dark:to-green-600';
        if (locationData.aqi <= 100) return 'from-yellow-100 to-yellow-300 dark:from-yellow-800 dark:to-yellow-600';
        if (locationData.aqi <= 150) return 'from-orange-100 to-orange-300 dark:from-orange-800 dark:to-orange-600';
        if (locationData.aqi <= 200) return 'from-red-200 to-red-400 dark:from-red-800 dark:to-red-600';
        if (locationData.aqi <= 300) return 'from-purple-200 to-purple-400 dark:from-purple-800 dark:to-purple-600';
        return 'from-red-400 to-red-600 dark:from-red-900 dark:to-red-700';
    };

    const fetchTips = async () => {
        try {
            setLoadingTips(true);
            const context = `
                                Vous êtes un assistant spécialisé en qualité de l'air (AQI). 
                                Données actuelles:
                                - Localisation: ${locationData.name}
                                - AQI: ${locationData.aqi} (${getAQILevel(locationData.aqi).level})
                                - PM2.5: ${locationData.pm25} µg/m³
                                - PM10: ${locationData.pm10} µg/m³
                                - Température: ${locationData.temperature}°C
                                - Humidité: ${locationData.humidity}%
                                - Dernière mise à jour: ${locationData.lastUpdated}
            
                                Répondez en français de manière concise et pratique. Donnez des conseils de santé spécifiques basés sur ces données.
                                Sois précis et évite les généralités. Si la question n'est pas liée à l'AQI, indique poliment que tu ne peux répondre qu'à des questions sur la qualité de l'air.
                                Ne dépasse pas 150 mots dans ta réponse.
                                Evite les caractères spéciaux inutiles dans ta réponse.
                                Fournis ta réponse en texte brut sans formatage markdown.
                        `

            const prompt = `${context}\n\nQuestion de l'utilisateur: Donne moi 2 à 3 conseils et bonnes pratiques pour naviguer dans un environnement avec un AQI de ${locationData.aqi}. Réponds exclisivement et directement en Anglais`

            const response = await answerUserQuestion({prompt});
            setTips(response);
        } catch (error) {
            console.error("Error fetching tips:", error);
        } finally {
            setLoadingTips(false);
        }
    }

    useEffect(() => {
        fetchTips();
    }, [locationData.aqi])

    const searchCenter = nearby?.searchCenter;
    const stationCount = nearby?.totalFound ?? nearby?.stations.length ?? null;
    const dataSources = useMemo(() => nearby?.dataAvailability?.primarySources ?? [], [nearby]);

    return (
        <section className="relative w-full rounded-2xl px-4 md:px-8 -mt-10 z-">
            <div className={`bg-gradient-to-br ${getBgGradient()} rounded-3xl p-6 md:p-8 shadow-md`}>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-block md:mb-0">
                        <h1 className="text-lg md:text-xl font-bold">Real-time Air Quality Index (AQI)</h1>
                    </button>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            onClick={onLocate}
                            disabled={locating}
                            variant="outline"
                            size="sm"
                            className="bg-white/90 hover:bg-white"
                        >
                            <MapPin className="w-4 h-4" />
                            {locating ? 'Locating…' : 'Locate me'}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                            <Heart className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Localisation */}
                <div className="">
                    <h2 className="text-blue-700 font-semibold text-lg underline cursor-pointer hover:text-blue-800">
                        {locationData.name}
                    </h2>
                    <p className="text-gray-700 text-sm">
                        Last Updated: {locationData.lastUpdated} (Local Time)
                    </p>
                    {searchCenter && (
                        <p className="text-gray-700 text-sm">
                            Zone géographique : {searchCenter.city ?? '—'} · {searchCenter.stateProvince ?? '—'} · {searchCenter.country ?? '—'}
                        </p>
                    )}
                    {stationCount !== null && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-700">
                            <span className="bg-white/70 dark:bg-zinc-900/40 px-3 py-1 rounded-full font-semibold">
                                {stationCount} station(s) suivie(s)
                            </span>
                            {dataSources.length > 0 && (
                                <span>Sources : {dataSources.join(', ')}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Contenu principal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                    {/* Section AQI */}
                    <div className="col-span-1">
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-gray-800 font-semibold">Live AQI</span>
                            </div>
                            <div className="flex items-baseline gap-3 mb-4">
                                <span className="text-6xl md:text-7xl font-bold text-yellow-600">
                                    {Math.round(locationData.aqi)}
                                </span>
                                <span className="text-gray-600 text-sm">(AQI-US)</span>
                            </div>
                            <div className="mb-4">
                                <p className="text-gray-800 font-medium mb-1">Air Quality is</p>
                                <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg inline-block">
                                    <span className="font-bold text-lg">{aqiLevel.level}</span>
                                </div>
                            </div>
                        </div>

                        {/* Échelle de couleurs */}
                        <div className="space-y-2">
                            <div className="flex rounded-lg overflow-hidden h-3">
                                <div className="bg-green-500 flex-1"></div>
                                <div className="bg-yellow-500 flex-1"></div>
                                <div className="bg-orange-500 flex-1"></div>
                                <div className="bg-red-500 flex-1"></div>
                                <div className="bg-purple-500 flex-1"></div>
                                <div className="bg-red-900 flex-1"></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-700 font-medium">
                                <span>Good</span>
                                <span>Moderate</span>
                                <span>Poor</span>
                                <span>Unhealthy</span>
                                <span>Severe</span>
                                <span>Hazardous</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>0</span>
                                <span>50</span>
                                <span>100</span>
                                <span>150</span>
                                <span>200</span>
                                <span>300</span>
                                <span>301+</span>
                            </div>
                        </div>
                    </div>

                    {/* Polluants */}
                    <div className="col-span-1 bg-white/40 rounded-2xl p-2 h-full w-full">
                        <div className="grid grid-cols-2 gap-3 bg-white/30 rounded-2xl p-2">
                            <div className="text-center">
                                <div className="text-gray-700 font-semibold mb-1">PM10 :</div>
                                <div className="font-bold text-xl text-gray-800">{locationData.pm10}</div>
                                <div className="text-gray-600 text-sm">μg/m³</div>
                            </div>
                            <div className="text-center">
                                <div className="text-gray-700 font-semibold mb-1">PM2.5 :</div>
                                <div className="font-bold text-xl text-gray-800">{locationData.pm25}</div>
                                <div className="text-gray-600 text-sm">μg/m³</div>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-white/50 rounded-xl">
                            <div className="flex items-center mb-3">
                                <BotIcon />
                                <h5 className="font-bold text-gray-800">AI Health Advisor</h5>
                            </div>

                            {loadingTips ? (
                                <div className="flex justify-center items-center h-24">
                                    <MinLoader />
                                </div>
                            ) : tips ? (
                                <p className="text-sm text-gray-700 leading-relaxed">{tips}</p>
                            ) : (
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-3">Get personalized health tips based on the current air quality data.</p>
                                    <Button onClick={fetchTips} disabled={loadingTips} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {loadingTips ? 'Generating...' : 'Get AI Tips'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AQIInfoSection
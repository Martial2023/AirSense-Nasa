'use client';

import { Cloud, Droplets, Eye, Gauge, Thermometer, Wind } from 'lucide-react';
import { LocationDataType, getAQILevel, getAQIBgClass } from '@/lib/types';
import { Card, CardContent } from '../ui/card';

interface AQIInfoPanelProps {
    locationData: LocationDataType;
}

const AQIInfoPanel: React.FC<AQIInfoPanelProps> = ({ locationData }) => {
    const aqiLevel = getAQILevel(locationData.aqi);
    const bgClass = getAQIBgClass(locationData.aqi);

    return (
        <div className="absolute top-[20] left-6 right-6 z-10">
            <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-3xl shadow-xl">
                {/* Header avec localisation */}
                <div className="">
                    <div className="flex items-center justify-between mb-1">
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                            Real-time Air Quality Index (AQI)
                        </h1>
                        <button className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                            <span>📍</span>
                            <span>My Location</span>
                        </button>
                    </div>
                    <h2 className="text-lg text-blue-600 font-semibold underline cursor-pointer hover:text-blue-700">
                        {locationData.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last Updated: {locationData.lastUpdated} (Local Time)
                    </p>
                </div>

                {/* Section principale AQI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="col-span-1 bg-red-600">
                        <div className="flex items-center space-x-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-red-600 mb-1">🔴 Live AQI</span>
                                <div className="flex items-baseline space-x-2">
                                    <span className={`text-6xl font-bold ${aqiLevel.textColor === 'text-white' ? 'text-gray-800' : aqiLevel.textColor}`}>
                                        {locationData.aqi}
                                    </span>
                                    <span className="text-gray-500 text-sm">(AQI-US)</span>
                                </div>
                            </div>
                        </div>

                        {/* Échelle de couleurs */}
                        <div className="mt-1 hidden">
                            <div className="flex rounded-lg overflow-hidden h-2 mb-2">
                                <div className="bg-green-500 flex-1"></div>
                                <div className="bg-amber-500 flex-1"></div>
                                <div className="bg-orange-500 flex-1"></div>
                                <div className="bg-red-500 flex-1"></div>
                                <div className="bg-purple-500 flex-1"></div>
                                <div className="bg-red-900 flex-1"></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Good</span>
                                <span>Moderate</span>
                                <span>Poor</span>
                                <span>Unhealthy</span>
                                <span>Severe</span>
                                <span>Hazardous</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
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
                    <div className="col-span-1">
                        <div className="grid grid-cols-2 gap-3">
                            <Card>
                                <CardContent className="p-3">
                                    <div className="text-xs text-gray-500 mb-1">PM10</div>
                                    <div className="font-bold text-lg">{locationData.pm10}</div>
                                    <div className="text-xs text-gray-400">μg/m³</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-3">
                                    <div className="text-xs text-gray-500 mb-1">PM2.5</div>
                                    <div className="font-bold text-lg">{locationData.pm25}</div>
                                    <div className="text-xs text-gray-400">μg/m³</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-3">
                                    <div className="text-xs text-gray-500 mb-1">NO₂</div>
                                    <div className="font-bold text-lg">{locationData.no2}</div>
                                    <div className="text-xs text-gray-400">μg/m³</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-3">
                                    <div className="text-xs text-gray-500 mb-1">O₃</div>
                                    <div className="font-bold text-lg">{locationData.o3}</div>
                                    <div className="text-xs text-gray-400">μg/m³</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Conditions météorologiques */}
                    <div className="lg:col-span-1">
                        <div className="space-y-3">
                            {/* Température et conditions */}
                            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <Cloud className="w-8 h-8 text-blue-500" />
                                    <div>
                                        <div className="text-2xl font-bold">{locationData.temperature}°C</div>
                                        <div className="text-sm text-gray-500">Partly cloudy</div>
                                    </div>
                                </div>
                            </div>

                            {/* Détails météo */}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                    <Droplets className="w-4 h-4 text-blue-500" />
                                    <span className="text-gray-600 dark:text-gray-300">Humidity</span>
                                    <span className="font-semibold ml-auto">{locationData.humidity}%</span>
                                </div>

                                <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                    <Wind className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600 dark:text-gray-300">Wind</span>
                                    <span className="font-semibold ml-auto">{locationData.windSpeed} km/h {locationData.windDirection}</span>
                                </div>

                                <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                    <Gauge className="w-4 h-4 text-purple-500" />
                                    <span className="text-gray-600 dark:text-gray-300">Pressure</span>
                                    <span className="font-semibold ml-auto">{locationData.pressure} hPa</span>
                                </div>

                                <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                    <Eye className="w-4 h-4 text-green-500" />
                                    <span className="text-gray-600 dark:text-gray-300">Visibility</span>
                                    <span className="font-semibold ml-auto">{locationData.visibility} km</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personnage et conseils */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl">
                    <div className="flex items-center space-x-4">
                        <div className="text-6xl">👤</div>
                        <div>
                            <div className="font-semibold text-gray-800 dark:text-white mb-1">
                                {aqiLevel.description}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                {aqiLevel.advice}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AQIInfoPanel;
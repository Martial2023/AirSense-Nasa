'use client'
import { answerUserQuestion } from '@/lib/AIAnalysisFunction'
import { getAQILevel, LocationDataType } from '@/lib/types'
import { BotIcon } from 'lucide-react'
import React, { useEffect } from 'react'
import MinLoader from '../MinLoader'
import { Button } from '../ui/button'

type Props = {
    data: LocationDataType | undefined
    isLoading: boolean
}

const AITipsForUser = ({ data, isLoading }: Props) => {
    const [tips, setTips] = React.useState<string>("")
    const [loadingTips, setLoadingTips] = React.useState<boolean>(false)

    const fetchTips = async () => {
        try {
            setLoadingTips(true)
            if (!data) return

            const context = `
        Vous êtes un assistant spécialisé en qualité de l'air (AQI). 
        Données actuelles:
        - Localisation: ${data.name}
        - AQI: ${data.aqi} (${getAQILevel(data.aqi).level})
        - PM2.5: ${data.pm25} µg/m³
        - PM10: ${data.pm10} µg/m³
        - Température: ${data.temperature}°C
        - Humidité: ${data.humidity}%
        - Dernière mise à jour: ${data.lastUpdated}

        Répondez en français de manière concise et pratique. Donnez des conseils de santé spécifiques basés sur ces données.
        Ne dépassez pas 70 mots. Répondez uniquement en anglais.
      `

            const prompt = `${context}\n\nQuestion: Give me 2 to 3 practical tips for an environment with AQI ${data.aqi}.`

            const response = await answerUserQuestion({ prompt })
            setTips(response)
        } catch (error) {
            console.error("Error fetching tips:", error)
        } finally {
            setLoadingTips(false)
        }
    }

    useEffect(() => {
        if (data?.aqi) fetchTips()
    }, [data?.aqi])

    return (
        <div className="col-span-1 md:col-span-7 flex flex-col items-center bg-white dark:bg-zinc-900 rounded-2xl shadow-md border border-zinc-200 dark:border-zinc-800 p-6 w-full transition-all duration-300">
            <div className="w-full grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "PM2.5", value: `${data?.pm25 ?? '--'} µg/m³` },
                    { label: "PM10", value: `${data?.pm10 ?? '--'} µg/m³` },
                    { label: "Température", value: `${data?.temperature ?? '--'} °C` },
                ].map((item, i) => (
                    <div
                        key={i}
                        className="flex flex-col items-center bg-zinc-100/60 dark:bg-zinc-800/60 p-4 rounded-xl text-center hover:shadow-sm transition"
                    >
                        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{item.label}</h2>
                        <span className="mt-1 text-lg font-semibold text-zinc-800 dark:text-zinc-100">{item.value}</span>
                    </div>
                ))}
            </div>

            <div className="w-full bg-zinc-50 dark:bg-zinc-800/70 p-5 rounded-xl mb-6 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2 mb-3">
                    <BotIcon className="w-5 h-5 text-blue-500" />
                    <h5 className="font-semibold text-zinc-800 dark:text-zinc-100">AI Health Advisor</h5>
                </div>

                {isLoading || loadingTips ? (
                    <div className="flex justify-center items-center h-24">
                        <MinLoader />
                    </div>
                ) : tips ? (
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{tips}</p>
                ) : (
                    <div className="text-center">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                            Get personalized tips based on the current air quality.
                        </p>
                        <Button
                            onClick={fetchTips}
                            disabled={loadingTips}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5"
                        >
                            {loadingTips ? 'Generating...' : 'Get AI Tips'}
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-2 w-full">
                <div className="flex rounded-full overflow-hidden h-2">
                    <div className="bg-green-500 flex-1"></div>
                    <div className="bg-yellow-400 flex-1"></div>
                    <div className="bg-orange-400 flex-1"></div>
                    <div className="bg-red-500 flex-1"></div>
                    <div className="bg-purple-500 flex-1"></div>
                    <div className="bg-red-900 flex-1"></div>
                </div>
                <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    <span>Good</span>
                    <span>Moderate</span>
                    <span>Poor</span>
                    <span>Unhealthy</span>
                    <span>Severe</span>
                    <span>Hazardous</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-500">
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
    )
}

export default AITipsForUser
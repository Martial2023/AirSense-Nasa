import { useState, useEffect } from 'react'
import { LocationDataType, mockLocationData } from '@/lib/types'

interface AQIMetadata {
  aqi: number
  location: string
  pm25: number
  pm10: number
  lastUpdated: string
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: string
}

export const useAQIMetadata = () => {
  const [metadata, setMetadata] = useState<AQIMetadata>({
    aqi: mockLocationData.aqi,
    location: mockLocationData.name,
    pm25: mockLocationData.pm25,
    pm10: mockLocationData.pm10,
    lastUpdated: mockLocationData.lastUpdated,
    temperature: mockLocationData.temperature,
    humidity: mockLocationData.humidity,
    windSpeed: mockLocationData.windSpeed,
    windDirection: mockLocationData.windDirection
  })

  // Fonction pour mettre à jour les métadonnées
  const updateMetadata = (newData: Partial<LocationDataType>) => {
    setMetadata(prev => ({
      ...prev,
      aqi: newData.aqi ?? prev.aqi,
      location: newData.name ?? prev.location,
      pm25: newData.pm25 ?? prev.pm25,
      pm10: newData.pm10 ?? prev.pm10,
      lastUpdated: newData.lastUpdated ?? prev.lastUpdated,
      temperature: newData.temperature ?? prev.temperature,
      humidity: newData.humidity ?? prev.humidity,
      windSpeed: newData.windSpeed ?? prev.windSpeed,
      windDirection: newData.windDirection ?? prev.windDirection
    }))
  }

  // Simulation de mise à jour automatique des données (optionnel)
  useEffect(() => {
    const interval = setInterval(() => {
      // Ici vous pourriez faire un appel API pour récupérer de vraies données
      // Pour la démo, on simule de petites variations
      setMetadata(prev => ({
        ...prev,
        aqi: Math.max(0, prev.aqi + (Math.random() - 0.5) * 10),
        lastUpdated: new Date().toLocaleString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        }) + ' ago'
      }))
    }, 300000) // Mise à jour toutes les 5 minutes

    return () => clearInterval(interval)
  }, [])

  return {
    metadata,
    updateMetadata
  }
}
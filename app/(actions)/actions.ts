'use server'
import { prisma } from "@/lib/prisma";

import { AQIForecastPoint, AQIForecastResponse, AQIHistoryPoint, LocationDataType } from "@/lib/types";


export async function subscribeToNotifications(data: { email: string; name: string; location: string }) {
    try {
        await prisma.userNotification.create({
            data,
        });
    } catch (error) {
        throw new Error('Subscription failed' + error);
    }
}

type FullLocationDataParams = {
    lat: number;
    lon: number;
};
const BASE_API_URL = process.env.BASE_API_URL
export async function getFullLocationData({ lat, lon }: FullLocationDataParams): Promise<LocationDataType> {
    try {
        if (!lat || !lon) {
            throw new Error("Latitude et longitude sont requises");
        }
        const url = new URL(`${BASE_API_URL}/location/full`);
        url.searchParams.set('latitude', lat.toString());
        url.searchParams.set('longitude', lon.toString());
        const response = await fetch(url.toString());
        if (!response.ok) {
            // throw new Error("Erreur lors de la récupération des données");
        }
        const data = await response.json();
        const fullData: LocationDataType = {
            name: data.name,
            coordinates: [lat, lon],
            aqi: data.aqi,
            pm25: data.pm25,
            pm10: data.pm10,
            no2: data.no2,
            o3: data.no3,
            so2: data.so2,
            co: data.co,
            temperature: data.temperature,
            humidity: data.humidity,
            windSpeed: data.windSpeed,
            windDirection: data.windDirection,
            pressure: data.pressure,
            visibility: data.visibility,
            lastUpdated: data.lastUpdated,
        }
        return fullData
        // return fullData;
    } catch (error) {
        console.error("Erreur lors de la récupération des données", error)
        throw new Error("Erreur lors de la récupération des données")
    }
}

const forecastLabelFormatter = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
});
export async function getAQIForecast(
    locationCoords: [number, number],
    hours = 24
): Promise<AQIForecastResponse> {
    if (!Array.isArray(locationCoords) || locationCoords.length !== 2) {
        throw new Error('Invalid location coordinates provided for AQI forecast.');
    }

    const [latitude, longitude] = locationCoords;

    const url = new URL(`${BASE_API_URL}/forecast`);
    url.searchParams.set('latitude', latitude.toString());
    url.searchParams.set('longitude', longitude.toString());
    url.searchParams.set('hours', hours.toString());

    let response: Response;
    try {
        response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
            cache: 'no-store',
        });
    } catch (error) {
        console.error("Failed to reach AQI forecast API", error);
        return {
            data: null,
            error: "Impossible d'atteindre l'API de prévision AQI.",
        };
    }

    if (!response.ok) {
        console.error('AQI forecast API returned non-ok status', {
            status: response.status,
            statusText: response.statusText,
        });
        return {
            data: null,
            error: `Requête de prévision AQI échouée (${response.status}).`,
        };
    }

    let payload: any;
    try {
        payload = await response.json();
    } catch (error) {
        console.error('Unable to parse AQI forecast payload', error);
        return {
            data: null,
            error: 'Réponse de prévision AQI mal formée.',
        };
    }

    if (!payload || !Array.isArray(payload.forecast)) {
        console.error('AQI forecast payload missing predictions array', payload);
        return {
            data: null,
            error: 'Réponse de prévision AQI mal formée.',
        };
    }

    const mappedPoints = (payload.forecast as any[]).map((item): AQIForecastPoint | null => {
        const isoTimestamp = typeof item?.timestamp === 'string' ? item.timestamp : '';
        const predictedAQI = Number(item?.aqi);
        const confidenceValue = Number(item?.confidence ?? 0);

        const timestampDate = new Date(isoTimestamp);
        if (!isoTimestamp || Number.isNaN(timestampDate.getTime()) || Number.isNaN(predictedAQI)) {
            return null;
        }

        const boundedConfidence = Math.max(0, Math.min(1, Number.isNaN(confidenceValue) ? 0 : confidenceValue));

        return {
            time: forecastLabelFormatter.format(timestampDate),
            isoTimestamp,
            aqi: Math.min(500, Math.max(0, Math.round(predictedAQI))),
            confidence: boundedConfidence,
        };
    });

    const points = mappedPoints
        .filter((point): point is AQIForecastPoint => point !== null)
        .sort((a: AQIForecastPoint, b: AQIForecastPoint) => new Date(a.isoTimestamp).getTime() - new Date(b.isoTimestamp).getTime());

    if (!points.length) {
        console.error('AQI forecast payload contained zero valid points', payload);
        return {
            data: null,
            error: 'Aucune donnée de prévision AQI disponible.',
        };
    }

    return {
        data: {
            generatedAt:
                typeof payload.forecast_timestamp === 'string'
                    ? payload.forecast_timestamp
                    : new Date().toISOString(),
            points,
        },
    };
}


const formatHistoryLabel = (date: Date) =>
    new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(date);

export async function getAQIPassData(locationCoords: [number, number]): Promise<AQIHistoryPoint[]> {
    if (!Array.isArray(locationCoords) || locationCoords.length !== 2) {
        throw new Error('Invalid location coordinates provided for AQI history.');
    }

    const [latitude, longitude] = locationCoords;

    const url = new URL(`${BASE_API_URL}/historical`);
    url.searchParams.set('latitude', latitude.toString());
    url.searchParams.set('longitude', longitude.toString());

    let response: Response;
    try {
        response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
            cache: 'no-store',
        });
    } catch (error) {
        console.error("Failed to reach AQI history API", error);
        return []
    }

    if (!response.ok) {
        console.error('AQI history API returned non-ok status', {
            status: response.status,
            statusText: response.statusText,
        });
        return [];
    }

    let payload: any;
    try {
        payload = await response.json();
    } catch (error) {
        console.error('Unable to parse AQI history payload', error);
        return []
    }

    if (!payload || !Array.isArray(payload.measurements)) {
        console.error('AQI history payload missing predictions array', payload);
        return []
    }

    const mappedPoints = (payload.measurements as any[]).map((item): AQIHistoryPoint | null => {
        const time = typeof item?.timestamp === 'string' ? item.timestamp : '';
        const historyAQI = Number(item?.aqi);

        const timestampDate = new Date(time);
        if (!time || Number.isNaN(timestampDate.getTime()) || Number.isNaN(historyAQI)) {
            return null;
        }

        return {
            time: formatHistoryLabel(timestampDate),
            aqi: Math.min(500, Math.max(0, Math.round(historyAQI))),
        };
    });

    const points = mappedPoints
        .filter((point): point is AQIHistoryPoint => point !== null)
        .sort((a: AQIHistoryPoint, b: AQIHistoryPoint) => new Date(a.time).getTime() - new Date(b.time).getTime());

    if (!points.length) {
        console.error('AQI history payload contained zero valid points', payload);
        return []
    }
    return points;
}
'use server'

import { parseNearbyStationsPayload } from "@/lib/nasaTempo"
import { prisma } from "@/lib/prisma"
import { NearbyStationsResult } from "@/lib/types"

export type AQIHistoryPoint = {
    time: string;
    aqi: number;
};

export type AQIForecastPoint = {
    time: string;
    isoTimestamp: string;
    aqi: number;
    confidence: number;
};

export type AQIForecastResult = {
    generatedAt: string;
    points: AQIForecastPoint[];
};

export type HistoryTrendPoint = {
    time: string;
    no2: number;
    o3: number;
    so2: number;
    composite: number;
};

const DAYS_OF_HISTORY = 30;
const NASA_TEMPO_FORECAST_URL = 'https://nasa-tempo-air-quality-api-4.onrender.com/api/v1/air-quality/forecast';
const NASA_TEMPO_NEARBY_URL = 'https://nasa-tempo-air-quality-api-4.onrender.com/api/v1/geolocation/nearby';

const forecastLabelFormatter = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
});

const formatHistoryLabel = (date: Date) =>
    new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(date);

const clampAQIValue = (value: number) => Math.min(500, Math.max(0, Math.round(value)));

const clampPollutantValue = (value: number) => Math.max(0, Math.round(value));

async function mockAQIHistoryAPI(locationCoords: [number, number]) {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const [lat, lng] = locationCoords;
    const now = new Date();
    const randomSeed = Math.abs(Math.sin(lat * lng)) * 100;

    return Array.from({ length: DAYS_OF_HISTORY }, (_, index) => {
        const day = new Date(now);
        day.setDate(now.getDate() - (DAYS_OF_HISTORY - 1 - index));

        const dailyVariation = (Math.random() - 0.5) * 40;
        const trend = Math.sin((index / DAYS_OF_HISTORY) * Math.PI) * 30;
        const baseAQI = 40 + randomSeed * 0.5;

        return {
            timestamp: day,
            aqi: clampAQIValue(baseAQI + trend + dailyVariation),
        };
    });
}

export async function getAQIPassData(locationCoords: [number, number]): Promise<AQIHistoryPoint[]> {
    if (!Array.isArray(locationCoords) || locationCoords.length !== 2) {
        throw new Error('Invalid location coordinates provided for AQI history.');
    }

    const apiResponse = await mockAQIHistoryAPI(locationCoords);

    return apiResponse.map(({ timestamp, aqi }) => ({
        time: formatHistoryLabel(timestamp),
        aqi,
    }));
}

export async function getAQIForecast(locationCoords: [number, number], hours = 24): Promise<AQIForecastResult> {
    if (!Array.isArray(locationCoords) || locationCoords.length !== 2) {
        throw new Error('Invalid location coordinates provided for AQI forecast.');
    }

    const [latitude, longitude] = locationCoords;

    const url = new URL(NASA_TEMPO_FORECAST_URL);
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
        throw new Error("Impossible d'atteindre l'API de prévision AQI.");
    }

    if (!response.ok) {
        throw new Error(`Requête de prévision AQI échouée (${response.status}).`);
    }

    const payload = await response.json();

    if (!payload || !Array.isArray(payload.predictions)) {
        throw new Error('Réponse de prévision AQI mal formée.');
    }

    const mappedPoints = (payload.predictions as any[]).map((item): AQIForecastPoint | null => {
            const isoTimestamp = typeof item?.timestamp === 'string' ? item.timestamp : '';
            const predictedAQI = Number(item?.predicted_aqi);
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
        throw new Error('Aucune donnée de prévision AQI disponible.');
    }

    return {
        generatedAt: typeof payload.forecast_timestamp === 'string' ? payload.forecast_timestamp : new Date().toISOString(),
        points,
    };
}

export async function getNearbyStations(
    locationCoords: [number, number],
    options?: { radiusKm?: number; limit?: number }
): Promise<NearbyStationsResult> {
    if (!Array.isArray(locationCoords) || locationCoords.length !== 2) {
        throw new Error('Invalid location coordinates provided for nearby station search.');
    }

    const [latitude, longitude] = locationCoords;
    const radiusKm = options?.radiusKm ?? 50;
    const limit = options?.limit ?? 20;

    const url = new URL(NASA_TEMPO_NEARBY_URL);
    url.searchParams.set('latitude', latitude.toString());
    url.searchParams.set('longitude', longitude.toString());
    url.searchParams.set('radius_km', radiusKm.toString());
    url.searchParams.set('limit', limit.toString());

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
        throw new Error("Impossible d'atteindre l'API de géolocalisation AQI.");
    }

    if (!response.ok) {
        throw new Error(`Requête de géolocalisation AQI échouée (${response.status}).`);
    }

    const payload = await response.json();

    return parseNearbyStationsPayload(payload, {
        fallback: {
            latitude,
            longitude,
            radiusKm,
            limit,
        },
        messages: {
            malformed: 'Réponse de géolocalisation AQI mal formée.',
            empty: 'Aucune station AQI disponible pour ces coordonnées.',
        },
    });
}

export async function subscribeToNotifications(data: { email: string; name: string; location: string }) {
    try {
        await prisma.userNotification.create({
            data,
        });
    } catch (error) {
        throw new Error('Subscription failed' + error);
    }
}

const pollutantProfiles = {
    no2: { base: 25, variation: 12 },
    o3: { base: 40, variation: 20 },
    so2: { base: 10, variation: 6 },
};

async function mockHistoryTrendAPI(locationCoords: [number, number]) {
    await new Promise((resolve) => setTimeout(resolve, 180));

    const [lat, lng] = locationCoords;
    const now = new Date();
    const seed = Math.abs(Math.cos(lat + lng)) * 50;

    return Array.from({ length: DAYS_OF_HISTORY }, (_, index) => {
        const day = new Date(now);
        day.setDate(now.getDate() - (DAYS_OF_HISTORY - 1 - index));

        const seasonal = Math.sin((index / DAYS_OF_HISTORY) * Math.PI * 2) * 8;
        const dailyNoise = (Math.random() - 0.5) * 10;

        const no2 = clampPollutantValue(pollutantProfiles.no2.base + seed * 0.2 + seasonal + dailyNoise);
        const o3 = clampPollutantValue(pollutantProfiles.o3.base + seed * 0.3 + seasonal * 1.4 + dailyNoise * 1.2);
        const so2 = clampPollutantValue(pollutantProfiles.so2.base + seed * 0.15 + seasonal * 0.7 + dailyNoise * 0.8);

        const composite = clampAQIValue((no2 * 0.3 + o3 * 0.5 + so2 * 0.2) * 2.5);

        return {
            timestamp: day,
            no2,
            o3,
            so2,
            composite,
        };
    });
}

export async function getHistoryTrend(locationCoords: [number, number]): Promise<HistoryTrendPoint[]> {
    if (!Array.isArray(locationCoords) || locationCoords.length !== 2) {
        throw new Error('Invalid location coordinates provided for trend history.');
    }

    const apiResponse = await mockHistoryTrendAPI(locationCoords);

    return apiResponse.map(({ timestamp, no2, o3, so2, composite }) => ({
        time: formatHistoryLabel(timestamp),
        no2,
        o3,
        so2,
        composite,
    }));
}
'use server'

import { prisma } from "@/lib/prisma"

export type AQIHistoryPoint = {
    time: string;
    aqi: number;
};

export type HistoryTrendPoint = {
    time: string;
    no2: number;
    o3: number;
    so2: number;
    composite: number;
};

const DAYS_OF_HISTORY = 30;

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
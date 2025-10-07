// Système de couleurs et niveaux AQI
export interface AQILevel {
    min: number;
    max: number;
    level: string;
    color: string;
    bgColor: string;
    textColor: string;
    description: string;
    advice: string;
}

export const AQI_LEVELS: AQILevel[] = [
    {
        min: 0,
        max: 50,
        level: "Good",
        color: "#10B981", // green-500
        bgColor: "bg-green-500",
        textColor: "text-white",
        description: "Air quality is considered satisfactory",
        advice: "Air quality is ideal for outdoor activities."
    },
    {
        min: 51,
        max: 100,
        level: "Moderate",
        color: "#F59E0B", // amber-500
        bgColor: "bg-amber-500",
        textColor: "text-white",
        description: "Air quality is acceptable",
        advice: "Sensitive individuals should consider reducing outdoor activities."
    },
    {
        min: 101,
        max: 150,
        level: "Unhealthy for Sensitive Groups",
        color: "#F97316", // orange-500
        bgColor: "bg-orange-500",
        textColor: "text-white",
        description: "Members of sensitive groups may experience health effects",
        advice: "Sensitive groups should limit prolonged outdoor exertion."
    },
    {
        min: 151,
        max: 200,
        level: "Unhealthy",
        color: "#EF4444", // red-500
        bgColor: "bg-red-500",
        textColor: "text-white",
        description: "Everyone may begin to experience health effects",
        advice: "Everyone should limit prolonged outdoor exertion."
    },
    {
        min: 201,
        max: 300,
        level: "Very Unhealthy",
        color: "#A855F7", // purple-500
        bgColor: "bg-purple-500",
        textColor: "text-white",
        description: "Health warnings of emergency conditions",
        advice: "Everyone should avoid outdoor activities."
    },
    {
        min: 301,
        max: 500,
        level: "Hazardous",
        color: "#7C2D12", // red-900
        bgColor: "bg-red-900",
        textColor: "text-white",
        description: "Health alert: everyone may experience serious health effects",
        advice: "Everyone should remain indoors with windows and doors closed."
    }
];

export const getAQILevel = (aqi: number): AQILevel => {
    return AQI_LEVELS.find(level => aqi >= level.min && aqi <= level.max) || AQI_LEVELS[0];
};

export const getAQIColor = (aqi: number): string => {
    return getAQILevel(aqi).color;
};

export const getAQIBgClass = (aqi: number): string => {
    return getAQILevel(aqi).bgColor;
};

// Données simulées pour la démonstration
export interface LocationDataType {
    name: string;
    coordinates: [number, number];
    aqi: number;
    pm25: number;
    pm10: number;
    no2: number;
    o3: number;
    so2: number;
    co: number;
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    pressure: number;
    visibility: number;
    lastUpdated: string;
}

export const mockLocationData: LocationDataType = {
    name: "Cotonou, Littoral, Benin",
    coordinates: [6.3665, 2.4185], // Coordonnées de Cotonou
    aqi: 25,
    pm25: 22,
    pm10: 26,
    no2: 15,
    o3: 45,
    so2: 8,
    co: 0.5,
    temperature: 2,
    humidity: 79,
    windSpeed: 12,
    windDirection: "SW",
    pressure: 1013,
    visibility: 10,
    lastUpdated: "4 minutes ago"
};

export interface NearbyStation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    distanceKm: number;
    type: string;
    pollutants: string[];
    network: string | null;
    status: string;
    lastUpdate: string | null;
}

export interface NearbyStationsResult {
    stations: NearbyStation[];
    totalFound: number;
    searchCenter: {
        latitude: number;
        longitude: number;
        city?: string | null;
        stateProvince?: string | null;
        country?: string | null;
    };
    parameters: {
        radiusKm: number;
        limit: number;
    };
    dataAvailability?: {
        primarySources: string[];
        airQualityStandard?: string | null;
        estimatedCoverage?: string | null;
    };
}

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

export type AQIForecastResponse = {
    data: AQIForecastResult | null;
    error?: string;
};

export type AQIHistoryPoint = {
    time: string;
    aqi: number;
};
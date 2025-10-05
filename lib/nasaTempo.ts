import { NearbyStation, NearbyStationsResult } from './types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const asRecord = (value: unknown): Record<string, unknown> => (isRecord(value) ? value : {});

const toNumberOrNull = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }

    return null;
};

const toStringOrNull = (value: unknown): string | null =>
    typeof value === 'string' && value.trim().length > 0 ? value : null;

const parseStationsArray = (value: unknown): NearbyStation[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item): NearbyStation | null => {
            if (!isRecord(item)) {
                return null;
            }

            const id = toStringOrNull(item.id);
            const name = toStringOrNull(item.name) ?? 'Station inconnue';
            const latitude = toNumberOrNull(item.latitude);
            const longitude = toNumberOrNull(item.longitude);
            const distanceKm = toNumberOrNull(item.distance_km);
            const type = toStringOrNull(item.type) ?? 'unknown';
            const status = toStringOrNull(item.status) ?? 'unknown';
            const network = toStringOrNull(item.network);
            const lastUpdate = toStringOrNull(item.last_update);

            if (id === null || latitude === null || longitude === null) {
                return null;
            }

            const pollutantsSource = item.pollutants;
            const pollutants = Array.isArray(pollutantsSource)
                ? pollutantsSource.filter((pollutant): pollutant is string => typeof pollutant === 'string')
                : [];

            return {
                id,
                name,
                latitude,
                longitude,
                distanceKm: distanceKm ?? 0,
                type,
                pollutants,
                network,
                status,
                lastUpdate,
            };
        })
        .filter((station): station is NearbyStation => station !== null);
};

export type NearbyParseOptions = {
    fallback: {
        latitude: number;
        longitude: number;
        radiusKm: number;
        limit: number;
    };
    messages?: {
        malformed?: string;
        empty?: string;
    };
};

export const parseNearbyStationsPayload = (
    payload: unknown,
    { fallback, messages }: NearbyParseOptions
): NearbyStationsResult => {
    const malformedMessage = messages?.malformed ?? 'Malformed NASA TEMPO nearby response.';
    const emptyMessage = messages?.empty ?? 'No monitoring station found for this location.';

    if (!isRecord(payload)) {
        throw new Error(malformedMessage);
    }

    const searchCenterRaw = asRecord(payload.search_center);
    const locationInfoRaw = asRecord(searchCenterRaw.location_info);
    const searchParametersRaw = asRecord(payload.search_parameters);
    const resultsRaw = asRecord(payload.results);
    const dataAvailabilityRaw = asRecord(payload.data_availability);

    const stations = parseStationsArray(resultsRaw.stations);

    if (!stations.length) {
        throw new Error(emptyMessage);
    }

    const radiusFromResponse = toNumberOrNull(searchParametersRaw.radius_km) ?? fallback.radiusKm;
    const limitFromResponse = toNumberOrNull(searchParametersRaw.limit) ?? fallback.limit;
    const totalFound = toNumberOrNull(resultsRaw.total_found) ?? stations.length;

    const primarySourcesSource = dataAvailabilityRaw.primary_sources;
    const primarySources = Array.isArray(primarySourcesSource)
        ? primarySourcesSource.filter((source): source is string => typeof source === 'string')
        : [];

    return {
        stations,
        totalFound,
        searchCenter: {
            latitude: toNumberOrNull(searchCenterRaw.latitude) ?? fallback.latitude,
            longitude: toNumberOrNull(searchCenterRaw.longitude) ?? fallback.longitude,
            city: toStringOrNull(locationInfoRaw.city),
            stateProvince: toStringOrNull(locationInfoRaw.state_province),
            country: toStringOrNull(locationInfoRaw.country),
        },
        parameters: {
            radiusKm: radiusFromResponse,
            limit: limitFromResponse,
        },
        dataAvailability: {
            primarySources,
            airQualityStandard: toStringOrNull(dataAvailabilityRaw.air_quality_standard),
            estimatedCoverage: toStringOrNull(dataAvailabilityRaw.estimated_coverage),
        },
    };
};

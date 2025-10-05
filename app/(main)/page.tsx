'use client';

import { getNearbyStations } from '@/app/actions';
import AQIChat from '@/components/AQIChat';
import AQIInfoSection from '@/components/AQIInfoSection';
import AirComposite from '@/components/components/AirComposite';
import AQIHistory from '@/components/components/AQIHistory';
import PredictedTrend from '@/components/components/PredictedTrend';
import HistoryTrend from '@/components/HistoryTrend';
import MinLoader from '@/components/MinLoader';
import { mockLocationData, LocationDataType, NearbyStationsResult } from '@/lib/types';
import dynamic from 'next/dynamic';
import React, { FormEvent, useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

const ShowLocationMap = dynamic(() => import('@/components/components/ShowLocationMap'), { ssr: false });

const DEFAULT_COORDINATES: [number, number] = [6.3665, 2.4185];
const DEFAULT_LOCATION: LocationDataType = {
    ...mockLocationData,
    coordinates: DEFAULT_COORDINATES,
};

const formatStationTimestamp = (isoString: string | null) => {
    if (!isoString) {
        return 'N/A';
    }

    const parsed = new Date(isoString);
    if (Number.isNaN(parsed.getTime())) {
        return isoString;
    }

    return parsed.toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const buildLocationDataFromStation = (
    station: NearbyStationsResult['stations'][number] | undefined,
    fallback: LocationDataType,
    searchCenter: NearbyStationsResult['searchCenter'] | null
): LocationDataType => {
    if (!station) {
        return {
            ...fallback,
            name:
                searchCenter?.city && searchCenter?.country
                    ? `${searchCenter.city}, ${searchCenter.country}`
                    : fallback.name,
        };
    }

    return {
        ...fallback,
        name: station.name,
        coordinates: [station.latitude, station.longitude],
        lastUpdated: formatStationTimestamp(station.lastUpdate),
    };
};

const Page = () => {
    const [coordinates, setCoordinates] = useState<[number, number]>(DEFAULT_COORDINATES);
    const [locationData, setLocationData] = useState<LocationDataType>(DEFAULT_LOCATION);
    const [nearby, setNearby] = useState<NearbyStationsResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isLocating, setIsLocating] = useState(false);
    const [latInput, setLatInput] = useState(coordinates[0].toFixed(4));
    const [lngInput, setLngInput] = useState(coordinates[1].toFixed(4));

    const coordsKey = useMemo(() => coordinates.map((value) => value.toFixed(6)).join(','), [coordinates]);

    useEffect(() => {
        setLatInput(coordinates[0].toFixed(4));
        setLngInput(coordinates[1].toFixed(4));
    }, [coordsKey]);

    useEffect(() => {
        setError(null);
        startTransition(() => {
            getNearbyStations(coordinates, { radiusKm: 50, limit: 20 })
                .then((result) => {
                    setNearby(result);
                    setLocationData((prev) =>
                        buildLocationDataFromStation(result.stations[0], { ...prev, coordinates }, result.searchCenter)
                    );
                })
                .catch((err) => {
                    console.error('Failed to load nearby stations', err);
                    setNearby(null);
                    setError("Impossible de récupérer les stations proches pour ces coordonnées.");
                });
        });
    }, [coordsKey, coordinates]);

    const updateCoordinates = useCallback((lat: number, lng: number) => {
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            toast.error('Les coordonnées doivent être des nombres valides.');
            return;
        }

        setCoordinates([lat, lng]);
        setLocationData((prev) => ({
            ...prev,
            coordinates: [lat, lng],
        }));
    }, []);

    const handleCoordinateSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const parsedLat = Number(latInput);
            const parsedLng = Number(lngInput);

            if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
                toast.error('Veuillez saisir des coordonnées valides.');
                return;
            }

            updateCoordinates(parsedLat, parsedLng);
        },
        [latInput, lngInput, updateCoordinates]
    );

    const handleGeolocation = useCallback(() => {
        if (!navigator.geolocation) {
            toast.error("La géolocalisation n'est pas disponible sur ce navigateur.");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                updateCoordinates(latitude, longitude);
                setIsLocating(false);
            },
            (geoError) => {
                console.error('Geolocation error', geoError);
                toast.error('Impossible de récupérer votre position.');
                setIsLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15_000,
                maximumAge: 0,
            }
        );
    }, [updateCoordinates]);

    const handleLocationSelected = useCallback(
        (coords: [number, number]) => {
            const [lat, lng] = coords;
            updateCoordinates(lat, lng);
        },
        [updateCoordinates]
    );

    const stationsToDisplay = useMemo(() => nearby?.stations.slice(0, 6) ?? [], [nearby]);

    return (
        <main className="min-h-screen px-2 md:px-4 space-y-6">
            <section className="grid gap-4 md:grid-cols-[1fr_auto] items-start">
                <div className="bg-white dark:bg-zinc-900/60 rounded-3xl shadow-xl p-4 md:p-6">
                    <h1 className="text-xl font-semibold mb-4">Configurer la localisation</h1>
                    <form onSubmit={handleCoordinateSubmit} className="grid gap-4 md:grid-cols-4">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Latitude</label>
                            <input
                                value={latInput}
                                onChange={(event) => setLatInput(event.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                placeholder="6.3665"
                                inputMode="decimal"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Longitude</label>
                            <input
                                value={lngInput}
                                onChange={(event) => setLngInput(event.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                placeholder="2.4185"
                                inputMode="decimal"
                            />
                        </div>
                        <div className="flex items-end gap-2 md:col-span-2">
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                                disabled={isPending}
                            >
                                Mettre à jour
                            </button>
                            <button
                                type="button"
                                onClick={handleGeolocation}
                                className="inline-flex items-center justify-center rounded-xl border border-blue-500 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-60"
                                disabled={isLocating}
                            >
                                {isLocating ? 'Localisation…' : 'Utiliser ma position'}
                            </button>
                        </div>
                    </form>
                    {error && (
                        <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
                            {error}
                        </p>
                    )}
                </div>
                <div className="bg-white dark:bg-zinc-900/60 rounded-3xl shadow-xl p-4 flex items-center justify-center min-h-[120px]">
                    <div className="text-center">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Coordonnées suivies</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{coordinates[0].toFixed(4)}° N</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{coordinates[1].toFixed(4)}° E</p>
                        {isPending && (
                            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <MinLoader />
                                <span>Chargement des stations…</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <ShowLocationMap data={locationData} onLocationSelected={handleLocationSelected} />

            <AQIInfoSection
                locationData={locationData}
                nearby={nearby ?? undefined}
                onLocate={handleGeolocation}
                locating={isLocating}
            />

            {stationsToDisplay.length > 0 && (
                <section className="bg-white dark:bg-zinc-900/60 rounded-3xl shadow-xl p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-lg font-semibold">Stations de surveillance à proximité</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {nearby?.totalFound ?? stationsToDisplay.length} station(s) trouvée(s) dans un rayon de {nearby?.parameters.radiusKm ?? 50} km.
                            </p>
                        </div>
                        {nearby?.searchCenter && (
                            <div className="text-sm text-gray-500 dark:text-gray-300">
                                Zone de recherche :
                                <span className="font-medium text-gray-700 dark:text-gray-200"> {nearby.searchCenter.city ?? 'Inconnue'}, {nearby.searchCenter.country ?? '—'}</span>
                            </div>
                        )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {stationsToDisplay.map((station) => (
                            <div key={station.id} className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">{station.name}</h3>
                                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            {station.type.replace(/_/g, ' ')} · {station.status}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => updateCoordinates(station.latitude, station.longitude)}
                                        className="text-xs font-medium text-blue-600 hover:underline"
                                    >
                                        Voir sur la carte
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Distance : <span className="font-medium">{station.distanceKm.toFixed(1)} km</span>
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Dernière mise à jour : <span className="font-medium">{formatStationTimestamp(station.lastUpdate)}</span>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Polluants suivis : {station.pollutants.length ? station.pollutants.join(', ') : 'Non spécifié'}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <AirComposite data={locationData} />

            <HistoryTrend data={locationData} />

            <PredictedTrend data={locationData} />

            <AQIHistory data={locationData} />

            <AQIChat data={locationData} />
        </main>
    );
};

export default Page;
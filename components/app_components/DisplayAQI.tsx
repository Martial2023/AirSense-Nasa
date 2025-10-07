'use client'

import React from "react";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import MinLoader from "../MinLoader";

type Props = {
    data: {
        city?: string;
        country?: string;
        aqi?: number;
        status?: string;
    };
    isLoading: boolean;
};

const DisplayAQI = ({ data, isLoading }: Props) => {
    const AQI = data?.aqi ?? 0;
    const city = data?.city ?? "Unknown City";
    const country = data?.country ?? "Unknown Country";
    const status = data?.status ?? "Unknown";

    const getColor = (aqi: number) => {
        if (aqi <= 50) return "#4ade80"; // very good - green
        if (aqi <= 100) return "#facc15"; // moderate - yellow
        if (aqi <= 150) return "#f97316"; // unhealthy for sensitive - orange
        if (aqi <= 200) return "#ef4444"; // unhealthy - red
        if (aqi <= 300) return "#a855f7"; // very unhealthy - purple
        return "#6b21a8"; // hazardous
    };

    return (
        <div className="flex items-center justify-center col-span-1 md:col-span-3 hover:scale-101 transition-transform duration-300">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="bg-white dark:bg-zinc-900 p-3 rounded-2xl shadow-sm w-full h-full"
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                        <MinLoader />
                        <p className="text-center">Loading...</p>
                    </div>
                ) : (
                    <>
                        {/* 🏙️ Ville & Pays */}
                        <div className="text-center mb-4">
                            <h2 className="text-xl font-semibold">{city}</h2>
                            <p className="text-sm text-gray-400 flex items-center justify-center gap-1">
                                <span role="img" aria-label="flag"></span> {country}
                            </p>
                        </div>

                        <div className="w-full flex flex-col items-center">
                            <div className="w-40 h-40 mb-4">
                                <CircularProgressbar
                                    className="hidden dark:block"
                                    value={AQI}
                                    maxValue={300}
                                    text={`${AQI}`}
                                    styles={buildStyles({
                                        textColor: "#fff",
                                        pathColor: getColor(AQI),
                                        trailColor: "rgba(128,128,128,0.1)",
                                        textSize: "24px",
                                        pathTransitionDuration: 1.5,
                                    })}
                                />
                                <CircularProgressbar
                                    className="block dark:hidden"
                                    value={AQI}
                                    maxValue={300}
                                    text={`${AQI}`}
                                    styles={buildStyles({
                                        textColor: "rgb(125, 128, 128)",
                                        pathColor: getColor(AQI),
                                        trailColor: "rgba(128,128,128,0.1)",
                                        textSize: "24px",
                                        pathTransitionDuration: 1.5,
                                    })}
                                />
                            </div>
                        </div>

                        <div
                            className="mt-2 px-4 py-1 rounded-full text-sm font-medium"
                            style={{
                                backgroundColor: `${getColor(AQI)}20`,
                                color: getColor(AQI),
                            }}
                        >
                            {status}
                        </div>

                        <div className="mt-6 flex items-center justify-center text-sm font-medium text-zinc-500 dark:text-zinc-400 tracking-wide">
                            <div className="h-3 w-3 rounded-full bg-red-400 animate-pulse mr-2 shadow-sm shadow-red-400/40"></div>
                            <span className="uppercase text-[0.8rem]">Live Air Quality Index (AQI)</span>
                        </div>

                    </>
                )}
            </motion.div>
        </div>
    );
};

export default DisplayAQI;
'use client';

import { LocationDataType } from '@/lib/types';
import React from 'react';
import { Cell, PieChart, ResponsiveContainer, Pie, Legend, Tooltip } from 'recharts';

type Props = {
    data: LocationDataType
}
const AirPieChart = ({ data }: Props) => {
    const chartData = [
        { name: 'NO2', value: data.no2 },
        { name: 'O3', value: data.o3 },
        { name: 'SO2', value: data.so2 },
        { name: 'PM2.5', value: data.pm25 },
        { name: 'PM10', value: data.pm10 },
        { name: 'CO', value: data.co },
    ].filter(d => d.value && d.value > 0); // Filtrer les valeurs nulles ou non définies

    const RADIAN = Math.PI / 180;
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#FF5733'];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderCustomizedLabel = (props: any) => {
        const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        // N'affiche le label que si la tranche est assez grande
        if (percent < 0.05) {
            return null;
        }

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className='h-[350px] w-full'>
            <h3 className="text-lg font-semibold text-center mb-2">Pollutant Distribution (µg/m³)</h3>
            <div className="h-full w-full p-2">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${Number(value).toFixed(2)} µg/m³`, name]} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default AirPieChart
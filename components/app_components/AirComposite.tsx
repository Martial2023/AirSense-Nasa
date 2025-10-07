import { LocationDataType } from '@/lib/types'
import React from 'react'
import AirPieChart from '../AirPieChart'
import { Cloud, Droplets, Eye, Wind } from 'lucide-react'
import MinLoader from '../MinLoader'

type Props = {
    data: LocationDataType | undefined
    loading: boolean
}
const AirComposite: React.FC<Props> = ({ data, loading }: Props) => {
    if (loading || !data) {
        return (
            <div className='w-full flex items-center justify-center col-span-1 md:col-span-2 bg-white dark:bg-zinc-900 my-4 rounded-2xl shadow-xl h-48'>
                <MinLoader />
                <p className='text-gray-400'>Loading...</p>
            </div>
        )
    }
    return (
        <section className='grid grid-cols-1 lg:grid-cols-2 items-center justify-center bg-white dark:bg-zinc-900 my-4 rounded-2xl shadow-sm'>
            <div className="p-6 space-y-6">
                <AirPieChart
                    data={data}
                />
            </div>
            <div className="cols-span-1 p-6 space-y-6">
                <div className="space-y-3 bg-primary/30 dark:bg-white/30 backdrop-blur-sm rounded-2xl p-6">
                    <div className="flex items-center gap-3 backdrop-blur-sm rounded-lg p-3">
                        <Cloud className="w-8 h-8 text-blue-600" />
                        <div>
                            <div className="text-2xl font-bold text-gray-800">
                                {data.temperature}°C
                            </div>
                            <div className="text-gray-700 text-sm">Partly cloudy</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="p-3 flex items-center justify-between bg-white/15 backdrop-blur-sm rounded-lg">
                            <div className="gap-2">
                                <Droplets className="w-6 h-6 text-blue-500" />
                                <span className="text-gray-700">Humidity</span>
                            </div>
                            <span className="font-semibold text-gray-800">{data.humidity}%</span>
                        </div>

                        <div className="p-3 flex items-center justify-between bg-white/15 backdrop-blur-sm rounded-lg">
                            <div className="gap-2">
                                <Wind className="w-6 h-6 text-gray-600" />
                                <span className="text-gray-700">Wind Speed</span>
                            </div>
                            <span className="font-semibold text-gray-800">{data.windSpeed} km/h</span>
                        </div>

                        <div className="p-3 flex items-center justify-between bg-white/15 backdrop-blur-sm rounded-lg">
                            <div className="gap-2">
                                <Eye className="w-6 h-6 text-green-500" />
                                <span className="text-gray-700">UV Index</span>
                            </div>
                            <span className="font-semibold text-gray-800">2</span>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    )
}

export default AirComposite
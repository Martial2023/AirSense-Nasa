import { LocationDataType } from '@/lib/types'
import React from 'react'

const CurrentAQIInfoLocation = ({ data }: { data: LocationDataType }) => {
  return (
    <div className='-translate-y-10 h-54 w-full bg-amber-300 bottom-[20] pl-10'>
      <div className='bg-green-400 w-full h-full'>
        <h2 className='text-lg font-bold'>{data.name}</h2>
        <p className='text-sm'>AQI: {data.aqi}</p>
        <p className='text-sm'>Last Updated: {data.lastUpdated}</p>
      </div>
    </div>
  )
}

export default CurrentAQIInfoLocation
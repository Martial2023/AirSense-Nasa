import AppNav from '@/components/app_components/AppNav'
import React from 'react'
import { SearchProvider } from './context/SearchContext'


type Props = {
    children: React.ReactNode
}
const layout = ({ children }: Props) => {
  return (
    <SearchProvider>
        <AppNav />
        {children}
    </SearchProvider>
  )
}

export default layout
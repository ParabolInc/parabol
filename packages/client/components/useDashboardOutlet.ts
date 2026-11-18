import {createContext, type RefObject, useContext} from 'react'
import type {DashboardQuery} from '../__generated__/DashboardQuery.graphql'

interface DashboardOutlet {
  viewer: DashboardQuery['response']['viewer']
  mainRef: RefObject<HTMLDivElement | null>
}

export const DashboardOutletContext = createContext<DashboardOutlet | null>(null)

// Null for a signed-out reader of a public page, which renders without the dashboard
const useDashboardOutlet = () => useContext(DashboardOutletContext)

export default useDashboardOutlet

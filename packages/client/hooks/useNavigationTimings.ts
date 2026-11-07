import {useLayoutEffect, useRef} from 'react'
import {useLocation} from 'react-router'
import matchReportedRoute from '../utils/matchReportedRoute'
import {startNavigation} from '../utils/navigationTimings'

const useNavigationTimings = () => {
  const {pathname} = useLocation()
  const routeKeyRef = useRef<string | undefined>(undefined)
  useLayoutEffect(() => {
    const {route, key} = matchReportedRoute(pathname)
    if (key === routeKeyRef.current) return
    routeKeyRef.current = key
    startNavigation(route)
  }, [pathname])
}

export default useNavigationTimings

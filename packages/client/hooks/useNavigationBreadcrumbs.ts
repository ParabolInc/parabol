import {useLocation} from '@tanstack/react-router'
import {useEffect} from 'react'
import {addBreadcrumb} from '../utils/clientBreadcrumbs'
import getReportedRoute from '../utils/getReportedRoute'

const useNavigationBreadcrumbs = () => {
  const {pathname} = useLocation()
  useEffect(() => {
    addBreadcrumb('navigation', getReportedRoute(pathname))
  }, [pathname])
}

export default useNavigationBreadcrumbs

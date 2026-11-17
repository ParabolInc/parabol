import {useEffect} from 'react'
import {useLocation} from 'react-router'
import {addBreadcrumb} from '../utils/clientBreadcrumbs'
import getReportedRoute from '../utils/getReportedRoute'

const useNavigationBreadcrumbs = () => {
  const {pathname} = useLocation()
  useEffect(() => {
    addBreadcrumb('navigation', getReportedRoute(pathname))
  }, [pathname])
}

export default useNavigationBreadcrumbs

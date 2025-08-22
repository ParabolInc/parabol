import {lazy} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'

const PrivatePage = lazy(() => import(/* webpackChunkName: 'PrivatePage' */ './PrivatePage'))
const PageRoot = lazy(() => import(/* webpackChunkName: 'PageRoot' */ '../modules/pages/PageRoot'))

const PageRoute = () => {
  const atmosphere = useAtmosphere()
  const {authObj} = atmosphere
  if (authObj) {
    return <PrivatePage />
  }
  return <PageRoot viewerRef={null} isPublic />
}

export default PageRoute

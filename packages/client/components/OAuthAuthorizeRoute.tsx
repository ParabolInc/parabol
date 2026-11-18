import {getRouteApi} from '@tanstack/react-router'
import useQueryRefLease from '../routing/useQueryRefLease'
import OAuthAuthorize from './OAuthAuthorize'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/authorize-app')

const OAuthAuthorizeRoute = () => {
  const {queryRef, request} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <OAuthAuthorize queryRef={queryRef} request={request} />
}

export default OAuthAuthorizeRoute

import {getRouteApi} from '@tanstack/react-router'
import useNoIndex from '../hooks/useNoIndex'
import useQueryRefLease from '../routing/useQueryRefLease'
import InvitationLink from './InvitationLink'

const routeApi = getRouteApi('/invitation-link/$token')

const InvitationLinkRoute = () => {
  useNoIndex()
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <InvitationLink queryRef={queryRef} />
}

export default InvitationLinkRoute

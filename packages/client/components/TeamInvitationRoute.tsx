import {getRouteApi} from '@tanstack/react-router'
import useNoIndex from '~/hooks/useNoIndex'
import useQueryRefLease from '../routing/useQueryRefLease'
import TeamInvitation from './TeamInvitation'

const routeApi = getRouteApi('/team-invitation/$token')

const TeamInvitationRoute = () => {
  useNoIndex()
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <TeamInvitation queryRef={queryRef} />
}

export default TeamInvitationRoute

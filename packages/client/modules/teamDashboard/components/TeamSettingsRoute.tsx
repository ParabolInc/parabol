import {getRouteApi} from '@tanstack/react-router'
import useQueryRefLease from '../../../routing/useQueryRefLease'
import TeamSettings from './TeamSettings/TeamSettings'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/dashboardLayout/team/$teamId/settings')

const TeamSettingsRoute = () => {
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  return <TeamSettings queryRef={queryRef} />
}

export default TeamSettingsRoute

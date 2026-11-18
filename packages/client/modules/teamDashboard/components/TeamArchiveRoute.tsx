import {getRouteApi} from '@tanstack/react-router'
import useDocumentTitle from '~/hooks/useDocumentTitle'
import useQueryRefLease from '../../../routing/useQueryRefLease'
import useTeamOutlet from '../containers/Team/useTeamOutlet'
import TeamArchive from './TeamArchive/TeamArchive'

const routeApi = getRouteApi('/tipTapLayout/privateLayout/dashboardLayout/team/$teamId/archive')

const TeamArchiveRoute = () => {
  const {team, teamId} = useTeamOutlet()
  const {queryRef} = routeApi.useLoaderData()
  useQueryRefLease(queryRef)
  useDocumentTitle(`Team Archive | ${team.name}`, 'Archive')
  return <TeamArchive returnToTeamId={teamId} teamRef={team} queryRef={queryRef} />
}

export default TeamArchiveRoute

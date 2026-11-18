import {getRouteApi} from '@tanstack/react-router'
import {useEffect} from 'react'
import setPreferredTeamId from '~/utils/relay/setPreferredTeamId'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useQueryRefLease from '../../../routing/useQueryRefLease'
import TeamDashMain from './TeamDashMain/TeamDashMain'

const routeApi = getRouteApi(
  '/tipTapLayout/privateLayout/dashboardLayout/team/$teamId/teamDashMainLayout'
)

const TeamDashMainRoute = () => {
  const {teamId} = routeApi.useParams()
  const {queryRef} = routeApi.useLoaderData()
  const atmosphere = useAtmosphere()
  useQueryRefLease(queryRef)
  useEffect(() => {
    setPreferredTeamId(atmosphere, teamId)
  }, [atmosphere, teamId])
  return <TeamDashMain queryRef={queryRef} />
}

export default TeamDashMainRoute

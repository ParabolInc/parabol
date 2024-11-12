import {Suspense} from 'react'
import setPreferredTeamId from '~/utils/relay/setPreferredTeamId'
import teamDashMainQuery, {
  TeamDashMainQuery
} from '../../../__generated__/TeamDashMainQuery.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import useRouter from '../../../hooks/useRouter'
import TeamDashMain from './TeamDashMain/TeamDashMain'

const TeamDashMainRoot = () => {
  const {match} = useRouter<{teamId: string}>()
  const {params} = match
  const {teamId} = params
  const atmosphere = useAtmosphere()
  setPreferredTeamId(atmosphere, teamId)
  const queryRef = useQueryLoaderNow<TeamDashMainQuery>(teamDashMainQuery, {teamId})
  return <Suspense fallback={''}>{queryRef && <TeamDashMain queryRef={queryRef} />}</Suspense>
}

export default TeamDashMainRoot

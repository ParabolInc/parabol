import {Suspense, useEffect} from 'react'
import {useParams} from 'react-router'
import setPreferredTeamId from '~/utils/relay/setPreferredTeamId'
import teamDashMainQuery, {
  type TeamDashMainQuery
} from '../../../__generated__/TeamDashMainQuery.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import TeamDashMain from './TeamDashMain/TeamDashMain'

const TeamDashMainRoot = () => {
  const {teamId} = useParams()
  const atmosphere = useAtmosphere()

  useEffect(() => {
    setPreferredTeamId(atmosphere, teamId!)
  }, [atmosphere, teamId])

  const queryRef = useQueryLoaderNow<TeamDashMainQuery>(teamDashMainQuery, {
    teamId: teamId!
  })
  return <Suspense fallback={''}>{queryRef && <TeamDashMain queryRef={queryRef} />}</Suspense>
}

export default TeamDashMainRoot

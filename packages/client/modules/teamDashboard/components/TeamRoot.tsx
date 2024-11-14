import {Suspense} from 'react'
import teamContainerQuery, {
  TeamContainerQuery
} from '../../../__generated__/TeamContainerQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import useRouter from '../../../hooks/useRouter'
import TeamContainer from '../containers/Team/TeamContainer'

const TeamRoot = () => {
  const {location, match} = useRouter<{teamId: string}>()
  const {params} = match
  const {teamId} = params
  const queryRef = useQueryLoaderNow<TeamContainerQuery>(teamContainerQuery, {teamId})
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <TeamContainer location={location} match={match} queryRef={queryRef} teamId={teamId} />
      )}
    </Suspense>
  )
}

export default TeamRoot

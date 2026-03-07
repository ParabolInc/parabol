import {Suspense} from 'react'
import {useLocation, useParams, useRouteMatch} from 'react-router'
import teamContainerQuery, {
  type TeamContainerQuery
} from '../../../__generated__/TeamContainerQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import TeamContainer from '../containers/Team/TeamContainer'

const TeamRoot = () => {
  const {teamId} = useParams<{teamId: string}>()
  const location = useLocation()
  const match = useRouteMatch()
  const queryRef = useQueryLoaderNow<TeamContainerQuery>(teamContainerQuery, {
    teamId
  })
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <TeamContainer location={location} match={match} queryRef={queryRef} teamId={teamId} />
      )}
    </Suspense>
  )
}

export default TeamRoot

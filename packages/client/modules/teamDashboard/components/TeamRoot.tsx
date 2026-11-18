import {useParams} from '@tanstack/react-router'
import {Suspense} from 'react'
import teamContainerQuery, {
  type TeamContainerQuery
} from '../../../__generated__/TeamContainerQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import TeamContainer from '../containers/Team/TeamContainer'

const TeamRoot = () => {
  const {teamId} = useParams({strict: false})
  const queryRef = useQueryLoaderNow<TeamContainerQuery>(teamContainerQuery, {
    teamId: teamId!
  })
  return (
    <Suspense fallback={''}>
      {queryRef && <TeamContainer queryRef={queryRef} teamId={teamId!} />}
    </Suspense>
  )
}

export default TeamRoot

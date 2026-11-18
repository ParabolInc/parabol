import {useParams} from '@tanstack/react-router'
import {Suspense} from 'react'
import teamInvitationQuery, {
  type TeamInvitationQuery
} from '~/__generated__/TeamInvitationQuery.graphql'
import useNoIndex from '~/hooks/useNoIndex'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import TeamInvitation from './TeamInvitation'

const TeamInvitationRoot = () => {
  useNoIndex()
  const {token} = useParams({strict: false})
  const queryRef = useQueryLoaderNow<TeamInvitationQuery>(teamInvitationQuery, {
    token: token!
  })
  return <Suspense fallback={''}>{queryRef && <TeamInvitation queryRef={queryRef} />}</Suspense>
}

export default TeamInvitationRoot

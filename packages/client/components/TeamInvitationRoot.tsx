import {Suspense} from 'react'
import {useParams} from 'react-router'
import teamInvitationQuery, {
  type TeamInvitationQuery
} from '~/__generated__/TeamInvitationQuery.graphql'
import useNoIndex from '~/hooks/useNoIndex'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import TeamInvitation from './TeamInvitation'

const TeamInvitationRoot = () => {
  useNoIndex()
  const {token} = useParams<{token: string}>()
  const queryRef = useQueryLoaderNow<TeamInvitationQuery>(teamInvitationQuery, {
    token
  })
  return <Suspense fallback={''}>{queryRef && <TeamInvitation queryRef={queryRef} />}</Suspense>
}

export default TeamInvitationRoot

import React, {Suspense} from 'react'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import massInvitationTokenLinkQuery, {
  MassInvitationTokenLinkQuery
} from '../__generated__/MassInvitationTokenLinkQuery.graphql'
import MassInvitationTokenLink from './MassInvitationTokenLink'

interface Props {
  meetingId: string | undefined
  teamId: string
}

const MassInvitationTokenLinkRoot = (props: Props) => {
  const {meetingId, teamId} = props
  const queryRef = useQueryLoaderNow<MassInvitationTokenLinkQuery>(massInvitationTokenLinkQuery, {
    meetingId,
    teamId
  })
  return (
    <Suspense fallback={''}>
      {queryRef && <MassInvitationTokenLink queryRef={queryRef} meetingId={meetingId} />}
    </Suspense>
  )
}

export default MassInvitationTokenLinkRoot

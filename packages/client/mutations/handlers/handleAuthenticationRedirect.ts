import type {AcceptTeamInvitationMutationReply$data} from '~/__generated__/AcceptTeamInvitationMutationReply.graphql'
import type {OnNextHandler, OnNextNavigateContext} from '../../types/relayMutations'
import getValidRedirectParam from '../../utils/getValidRedirectParam'
import SendClientSideEvent from '../../utils/SendClientSideEvent'

interface OnNextMeetingId extends OnNextNavigateContext {
  meetingId?: string | null
  redirectPath?: string
}

const handleAuthenticationRedirect: OnNextHandler<
  AcceptTeamInvitationMutationReply$data | undefined,
  OnNextMeetingId
> = (
  acceptTeamInvitation,
  {meetingId: locallyRequestedMeetingId, navigate, atmosphere, redirectPath = '/meetings'}
) => {
  SendClientSideEvent(atmosphere, 'User Login')
  const redirectTo = getValidRedirectParam()
  if (redirectTo) {
    navigate(redirectTo)
    return
  }
  if (!acceptTeamInvitation?.team) {
    navigate(redirectPath)
    return
  }
  const {meetingId: invitedMeetingId, team} = acceptTeamInvitation
  const {id: teamId, activeMeetings} = team
  const meetingId = locallyRequestedMeetingId || invitedMeetingId
  const activeMeeting =
    (meetingId && activeMeetings.find((meeting) => meeting.id === meetingId)) || activeMeetings[0]
  if (activeMeeting) {
    navigate(`/meet/${activeMeeting.id}`)
  } else {
    navigate(`/team/${teamId}`)
  }
}
export default handleAuthenticationRedirect

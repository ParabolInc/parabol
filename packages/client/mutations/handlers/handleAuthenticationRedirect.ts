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
  // replace a used invitation page, or Back lands on it and it redirects again
  const isOnInvitationPage = /^\/(team-invitation|invitation-link)\//.test(window.location.pathname)
  const redirectTo = getValidRedirectParam()
  if (redirectTo) {
    navigate(redirectTo, {replace: isOnInvitationPage})
    return
  }
  if (!acceptTeamInvitation?.team) {
    navigate(redirectPath, {replace: isOnInvitationPage})
    return
  }
  const {meetingId: invitedMeetingId, team} = acceptTeamInvitation
  const {id: teamId, activeMeetings} = team
  const meetingId = locallyRequestedMeetingId || invitedMeetingId
  const activeMeeting =
    (meetingId && activeMeetings.find((meeting) => meeting.id === meetingId)) || activeMeetings[0]
  if (activeMeeting) {
    navigate(`/meet/${activeMeeting.id}`, {replace: isOnInvitationPage})
  } else {
    navigate(`/team/${teamId}`, {replace: isOnInvitationPage})
  }
}
export default handleAuthenticationRedirect

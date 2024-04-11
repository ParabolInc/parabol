import {AcceptTeamInvitationMutationReply$data} from '~/__generated__/AcceptTeamInvitationMutationReply.graphql'
import {OnNextHandler, OnNextHistoryContext} from '../../types/relayMutations'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import getValidRedirectParam from '../../utils/getValidRedirectParam'

interface OnNextMeetingId extends OnNextHistoryContext {
  meetingId?: string | null
  redirectPath?: string
}

const handleAuthenticationRedirect: OnNextHandler<
  AcceptTeamInvitationMutationReply$data | undefined,
  OnNextMeetingId
> = (
  acceptTeamInvitation,
  {meetingId: locallyRequestedMeetingId, history, atmosphere, redirectPath = '/meetings'}
) => {
  SendClientSideEvent(atmosphere, 'User Login')
  const redirectTo = getValidRedirectParam()
  if (redirectTo) {
    history.push(redirectTo)
    return
  }
  if (!acceptTeamInvitation?.team) {
    history.push(redirectPath)
    return
  }
  const {meetingId: invitedMeetingId, team} = acceptTeamInvitation
  const {id: teamId, activeMeetings} = team
  const meetingId = locallyRequestedMeetingId || invitedMeetingId
  const activeMeeting =
    (meetingId && activeMeetings.find((meeting) => meeting.id === meetingId)) || activeMeetings[0]
  if (activeMeeting) {
    history.push(`/meet/${activeMeeting.id}`)
  } else {
    history.push(`/team/${teamId}`)
  }
}
export default handleAuthenticationRedirect

import {AcceptTeamInvitationMutationReply$data} from '~/__generated__/AcceptTeamInvitationMutationReply.graphql'
import {OnNextHandler, OnNextHistoryContext} from '../../types/relayMutations'
import getValidRedirectParam from '../../utils/getValidRedirectParam'
import SendClientSegmentEventMutation from '../SendClientSegmentEventMutation'

interface OnNextMeetingId extends OnNextHistoryContext {
  meetingId?: string | null
}

const handleAuthenticationRedirect: OnNextHandler<
  AcceptTeamInvitationMutationReply$data | undefined,
  OnNextMeetingId
> = (acceptTeamInvitation, {meetingId: locallyRequestedMeetingId, history, atmosphere}) => {
  SendClientSegmentEventMutation(atmosphere, 'User Login')
  const redirectTo = getValidRedirectParam()
  if (redirectTo) {
    history.push(redirectTo)
    return
  }
  if (!acceptTeamInvitation?.team) {
    history.push('/meetings')
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

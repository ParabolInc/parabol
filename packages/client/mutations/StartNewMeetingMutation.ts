import {StartNewMeetingMutation as TStartNewMeetingMutation} from '../__generated__/StartNewMeetingMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {
  HistoryLocalHandler,
  OnNextHandler,
  OnNextHistoryContext,
  StandardMutation
} from '../types/relayMutations'
import isLegacyMeetingPath from '../utils/isLegacyMeetingPath'
import {StartNewMeetingMutation_team} from '__generated__/StartNewMeetingMutation_team.graphql'

graphql`
  fragment StartNewMeetingMutation_team on StartNewMeetingPayload {
    meetingId
    team {
      ...DashAlertMeetingActiveMeetings @relay(mask: false)
    }
    # TODO Fetch the RetroRoot Query so we don't need to fetch again
  }
`

const mutation = graphql`
  mutation StartNewMeetingMutation($teamId: ID!, $meetingType: MeetingTypeEnum!) {
    startNewMeeting(teamId: $teamId, meetingType: $meetingType) {
      ...StartNewMeetingMutation_team @relay(mask: false)
    }
  }
`

export const startNewMeetingTeamOnNext: OnNextHandler<
  StartNewMeetingMutation_team,
  OnNextHistoryContext
> = (payload, context) => {
  const {history} = context
  const {meetingId} = payload
  const readyToRedirect = isLegacyMeetingPath()
  if (readyToRedirect) {
    history.push(`/meet/${meetingId}`)
  }
}

const StartNewMeetingMutation: StandardMutation<TStartNewMeetingMutation, HistoryLocalHandler> = (
  atmosphere,
  variables,
  {history, onError, onCompleted}
) => {
  return commitMutation<TStartNewMeetingMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      startNewMeetingTeamOnNext(res.startNewMeeting, {atmosphere, history})
      onCompleted?.(res, errors)
    }
  })
}

export default StartNewMeetingMutation

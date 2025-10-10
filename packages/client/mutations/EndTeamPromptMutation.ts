import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {RecordProxy} from 'relay-runtime'
import type {EndTeamPromptMutation_team$data} from '~/__generated__/EndTeamPromptMutation_team.graphql'
import onMeetingRoute from '~/utils/onMeetingRoute'
import type {EndTeamPromptMutation as TEndTeamPromptMutation} from '../__generated__/EndTeamPromptMutation.graphql'
import type {
  HistoryMaybeLocalHandler,
  OnNextHandler,
  OnNextHistoryContext,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import {GQLID} from '../utils/GQLID'
import handleAddTimelineEvent from './handlers/handleAddTimelineEvent'

graphql`
  fragment EndTeamPromptMutation_team on EndTeamPromptSuccess {
    meeting {
      id
      endedAt
      summaryPageId
      ...TeamPromptMeetingStatus_meeting
      ...TeamPromptMeeting_meeting
    }
    team {
      id
      activeMeetings {
        id
      }
      agendaItems {
        id
      }
    }
    timelineEvent {
      ...TimelineEventTeamPromptComplete_timelineEvent @relay(mask: false)
    }
  }
`

graphql`
  fragment EndTeamPromptMutation_meeting on EndTeamPromptSuccess {
    meeting {
      ...WholeMeetingSummary_meeting
    }
  }
`

const mutation = graphql`
  mutation EndTeamPromptMutation($meetingId: ID!) {
    endTeamPrompt(meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...EndTeamPromptMutation_team @relay(mask: false)
      ...EndTeamPromptMutation_meeting @relay(mask: false)
    }
  }
`

export const endTeamPromptTeamOnNext: OnNextHandler<
  EndTeamPromptMutation_team$data,
  OnNextHistoryContext
> = (payload, context) => {
  const {meeting} = payload
  const {history} = context
  if (!meeting) return
  const {id: meetingId, summaryPageId} = meeting
  if (onMeetingRoute(window.location.pathname, [meetingId])) {
    if (summaryPageId) {
      const pageCode = GQLID.fromKey(summaryPageId)[0]
      history.push(`/pages/${pageCode}`)
    }
  }
}

export const endTeamPromptTeamUpdater: SharedUpdater<EndTeamPromptMutation_team$data> = (
  payload,
  {store}
) => {
  const meeting = payload.getLinkedRecord('meeting') as RecordProxy
  const timelineEvent = payload.getLinkedRecord('timelineEvent') as RecordProxy
  handleAddTimelineEvent(meeting, timelineEvent, store)
}

const EndTeamPromptMutation: StandardMutation<TEndTeamPromptMutation, HistoryMaybeLocalHandler> = (
  atmosphere,
  variables,
  {onError, onCompleted, history}
) => {
  return commitMutation<TEndTeamPromptMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('endTeamPrompt')
      if (!payload) return
      const context = {atmosphere, store: store as any}
      endTeamPromptTeamUpdater(payload as any, context)
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      endTeamPromptTeamOnNext(res.endTeamPrompt as any, {
        atmosphere,
        history
      })
    },
    onError
  })
}

export default EndTeamPromptMutation

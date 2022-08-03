import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {RecordProxy} from 'relay-runtime'
import onMeetingRoute from '~/utils/onMeetingRoute'
import {EndTeamPromptMutation_team} from '~/__generated__/EndTeamPromptMutation_team.graphql'
import {
  HistoryMaybeLocalHandler,
  OnNextHandler,
  OnNextHistoryContext,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import {EndTeamPromptMutation as TEndTeamPromptMutation} from '../__generated__/EndTeamPromptMutation.graphql'
import handleAddTimelineEvent from './handlers/handleAddTimelineEvent'

graphql`
  fragment EndTeamPromptMutation_team on EndTeamPromptSuccess {
    meeting {
      id
      endedAt
      teamId
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
      id
      team {
        id
        name
      }
      type
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
    }
  }
`

export const endTeamPromptTeamOnNext: OnNextHandler<
  EndTeamPromptMutation_team,
  OnNextHistoryContext
> = (payload, context) => {
  const {meeting} = payload
  const {history} = context
  if (!meeting) return
  const {id: meetingId} = meeting
  if (onMeetingRoute(window.location.pathname, [meetingId])) {
    history.push(`/new-summary/${meetingId}`)
  }
}

export const endTeamPromptTeamUpdater: SharedUpdater<EndTeamPromptMutation_team> = (
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
      endTeamPromptTeamOnNext(res.endTeamPrompt as any, {atmosphere, history})
    },
    onError
  })
}

export default EndTeamPromptMutation

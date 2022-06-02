import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {RecordProxy} from 'relay-runtime'
import {EndTeamPromptMutation_team} from '~/__generated__/EndTeamPromptMutation_team.graphql'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
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

export const endTeamPromptTeamUpdater: SharedUpdater<EndTeamPromptMutation_team> = (
  payload,
  {store}
) => {
  const meeting = payload.getLinkedRecord('meeting') as RecordProxy
  const timelineEvent = payload.getLinkedRecord('timelineEvent') as RecordProxy
  handleAddTimelineEvent(meeting, timelineEvent, store)
}

const EndTeamPromptMutation: StandardMutation<TEndTeamPromptMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
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
    onCompleted,
    onError
  })
}

export default EndTeamPromptMutation

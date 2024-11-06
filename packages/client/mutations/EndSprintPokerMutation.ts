import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {RecordProxy} from 'relay-runtime'
import {EndSprintPokerMutation_team$data} from '~/__generated__/EndSprintPokerMutation_team.graphql'
import onMeetingRoute from '~/utils/onMeetingRoute'
import {EndSprintPokerMutation as TEndSprintPokerMutation} from '../__generated__/EndSprintPokerMutation.graphql'
import {
  HistoryMaybeLocalHandler,
  OnNextHandler,
  OnNextHistoryContext,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import handleAddTimelineEvent from './handlers/handleAddTimelineEvent'
import handleRemoveTasks from './handlers/handleRemoveTasks'
import popEndMeetingToast from './toasts/popEndMeetingToast'

graphql`
  fragment EndSprintPokerMutation_team on EndSprintPokerSuccess {
    isKill
    meeting {
      id
      endedAt
      teamId
      commentCount
      storyCount
      name
      phases {
        phaseType
        ... on EstimatePhase {
          stages {
            id
          }
        }
      }
      locked
      organization {
        id
        viewerOrganizationUser {
          id
        }
      }
    }
    team {
      id
      activeMeetings {
        id
      }
    }
    timelineEvent {
      ...TimelineEventPokerComplete_timelineEvent @relay(mask: false)
    }
    removedTaskIds
  }
`

const mutation = graphql`
  mutation EndSprintPokerMutation($meetingId: ID!) {
    endSprintPoker(meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...EndSprintPokerMutation_team @relay(mask: false)
    }
  }
`

export const endSprintPokerTeamOnNext: OnNextHandler<
  EndSprintPokerMutation_team$data,
  OnNextHistoryContext
> = (payload, context) => {
  const {isKill, meeting} = payload
  const {atmosphere, history} = context
  if (!meeting) return
  const {id: meetingId, teamId} = meeting
  if (onMeetingRoute(window.location.pathname, [meetingId])) {
    if (isKill) {
      history.push(`/team/${teamId}`)
      popEndMeetingToast(atmosphere, meetingId)
    } else {
      history.push(`/new-summary/${meetingId}`)
    }
  }
}

export const endSprintPokerTeamUpdater: SharedUpdater<EndSprintPokerMutation_team$data> = (
  payload,
  {store}
) => {
  const removedTaskIds = payload.getValue('removedTaskIds')
  handleRemoveTasks(removedTaskIds as any, store)

  const meeting = payload.getLinkedRecord('meeting') as RecordProxy
  const timelineEvent = payload.getLinkedRecord('timelineEvent') as RecordProxy
  handleAddTimelineEvent(meeting, timelineEvent, store)
}

const EndSprintPokerMutation: StandardMutation<
  TEndSprintPokerMutation,
  HistoryMaybeLocalHandler
> = (atmosphere, variables, {onError, onCompleted, history}) => {
  return commitMutation<TEndSprintPokerMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('endSprintPoker')
      if (!payload) return
      const context = {atmosphere, store: store as any}
      endSprintPokerTeamUpdater(payload as any, context)
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      endSprintPokerTeamOnNext(res.endSprintPoker as any, {atmosphere, history})
    },
    onError
  })
}

export default EndSprintPokerMutation

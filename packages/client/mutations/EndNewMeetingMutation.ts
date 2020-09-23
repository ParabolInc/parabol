import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import onMeetingRoute from '~/utils/onMeetingRoute'
import {EndNewMeetingMutation_notification} from '~/__generated__/EndNewMeetingMutation_notification.graphql'
import {EndNewMeetingMutation_team} from '~/__generated__/EndNewMeetingMutation_team.graphql'
import Atmosphere from '../Atmosphere'
import {RetroDemo} from '../types/constEnums'
import {
  HistoryMaybeLocalHandler,
  OnNextHandler,
  OnNextHistoryContext,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import {EndNewMeetingMutation as TEndNewMeetingMutation} from '../__generated__/EndNewMeetingMutation.graphql'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'
import handleRemoveTasks from './handlers/handleRemoveTasks'
import handleUpsertTasks from './handlers/handleUpsertTasks'
import handleAddTimelineEvent from './handlers/handleAddTimelineEvent'
import {RecordProxy} from 'relay-runtime'

graphql`
  fragment EndNewMeetingMutation_team on EndNewMeetingPayload {
    isKill
    meeting {
      id
      endedAt
      teamId
      ... on ActionMeeting {
        agendaItemCount
        commentCount
        taskCount
      }
      ... on RetrospectiveMeeting {
        commentCount
        reflectionCount
        taskCount
        topicCount
      }
    }
    removedTaskIds
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
    updatedTasks {
      id
      content
      tags
      teamId
      threadId
      threadSource
      meetingId
      updatedAt
      userId
    }
  }
`

graphql`
  fragment EndNewMeetingMutation_notification on EndNewMeetingPayload {
    removedSuggestedActionId
  }
`

const mutation = graphql`
  mutation EndNewMeetingMutation($meetingId: ID!) {
    endNewMeeting(meetingId: $meetingId) {
      error {
        message
      }
      ...EndNewMeetingMutation_notification @relay(mask: false)
      ...EndNewMeetingMutation_team @relay(mask: false)
    }
  }
`

const popEndNewMeetingToast = (atmosphere: Atmosphere, meetingId: string) => {
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: `meetingKilled:${meetingId}`,
    autoDismiss: 5,
    message: `The meeting has been terminated`
  })
}

export const endNewMeetingTeamOnNext: OnNextHandler<
  EndNewMeetingMutation_team,
  OnNextHistoryContext
> = (payload, context) => {
  const {isKill, meeting} = payload
  const {atmosphere, history} = context
  if (!meeting) return
  const {id: meetingId, teamId} = meeting
  if (meetingId === RetroDemo.MEETING_ID) {
    if (isKill) {
      window.localStorage.removeItem('retroDemo')
      history.push('/create-account')
    } else {
      history.push('/retrospective-demo-summary')
    }
  } else if (onMeetingRoute(window.location.pathname, [meetingId])) {
    if (isKill) {
      history.push(`/team/${teamId}`)
      popEndNewMeetingToast(atmosphere, meetingId)
    } else {
      history.push(`/new-summary/${meetingId}`)
    }
  }
}

export const endNewMeetingNotificationUpdater: SharedUpdater<EndNewMeetingMutation_notification> = (
  payload,
  {store}
) => {
  const removedSuggestedActionId = payload.getValue('removedSuggestedActionId')
  handleRemoveSuggestedActions(removedSuggestedActionId, store)
}

export const endNewMeetingTeamUpdater: SharedUpdater<EndNewMeetingMutation_team> = (
  payload,
  {store}
) => {
  const updatedTasks = payload.getLinkedRecords('updatedTasks')
  const removedTaskIds = payload.getValue('removedTaskIds')
  const meeting = payload.getLinkedRecord('meeting') as RecordProxy
  const timelineEvent = payload.getLinkedRecord('timelineEvent') as RecordProxy
  handleAddTimelineEvent(meeting, timelineEvent, store)
  handleRemoveTasks(removedTaskIds as any, store)
  handleUpsertTasks(updatedTasks as any, store)
}

const EndNewMeetingMutation: StandardMutation<TEndNewMeetingMutation, HistoryMaybeLocalHandler> = (
  atmosphere,
  variables,
  {onError, onCompleted, history}
) => {
  return commitMutation<TEndNewMeetingMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('endNewMeeting')
      if (!payload) return
      const context = {atmosphere, store: store as any}
      endNewMeetingNotificationUpdater(payload, context)
      endNewMeetingTeamUpdater(payload, context)
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      endNewMeetingTeamOnNext(res.endNewMeeting, {atmosphere, history})
    },
    onError
  })
}

export default EndNewMeetingMutation

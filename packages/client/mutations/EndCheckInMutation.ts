import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import onMeetingRoute from '~/utils/onMeetingRoute'
import {EndCheckInMutation_notification} from '~/__generated__/EndCheckInMutation_notification.graphql'
import {EndCheckInMutation_team} from '~/__generated__/EndCheckInMutation_team.graphql'
import Atmosphere from '../Atmosphere'
import {
  HistoryMaybeLocalHandler,
  OnNextHandler,
  OnNextHistoryContext,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import {EndCheckInMutation as TEndCheckInMutation} from '../__generated__/EndCheckInMutation.graphql'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'
import handleRemoveTasks from './handlers/handleRemoveTasks'
import handleUpsertTasks from './handlers/handleUpsertTasks'
import handleAddTimelineEvent from './handlers/handleAddTimelineEvent'
import {RecordProxy} from 'relay-runtime'

graphql`
  fragment EndCheckInMutation_team on EndCheckInPayload {
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
  fragment EndCheckInMutation_notification on EndCheckInPayload {
    removedSuggestedActionId
  }
`

const mutation = graphql`
  mutation EndCheckInMutation($meetingId: ID!) {
    endCheckIn(meetingId: $meetingId) {
      error {
        message
      }
      ...EndCheckInMutation_notification @relay(mask: false)
      ...EndCheckInMutation_team @relay(mask: false)
    }
  }
`

const popEndCheckInToast = (atmosphere: Atmosphere, meetingId: string) => {
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: `meetingKilled:${meetingId}`,
    autoDismiss: 5,
    message: `The meeting has been terminated`
  })
}

export const endCheckInTeamOnNext: OnNextHandler<EndCheckInMutation_team, OnNextHistoryContext> = (
  payload,
  context
) => {
  const {isKill, meeting} = payload
  const {atmosphere, history} = context
  if (!meeting) return
  const {id: meetingId, teamId} = meeting
  if (onMeetingRoute(window.location.pathname, [meetingId])) {
    if (isKill) {
      history.push(`/team/${teamId}`)
      popEndCheckInToast(atmosphere, meetingId)
    } else {
      history.push(`/new-summary/${meetingId}`)
    }
  }
}

export const endCheckInNotificationUpdater: SharedUpdater<EndCheckInMutation_notification> = (
  payload,
  {store}
) => {
  const removedSuggestedActionId = payload.getValue('removedSuggestedActionId')
  handleRemoveSuggestedActions(removedSuggestedActionId, store)
}

export const endCheckInTeamUpdater: SharedUpdater<EndCheckInMutation_team> = (payload, {store}) => {
  const updatedTasks = payload.getLinkedRecords('updatedTasks')
  const removedTaskIds = payload.getValue('removedTaskIds')
  const meeting = payload.getLinkedRecord('meeting') as RecordProxy
  const timelineEvent = payload.getLinkedRecord('timelineEvent') as RecordProxy
  handleAddTimelineEvent(meeting, timelineEvent, store)
  handleRemoveTasks(removedTaskIds as any, store)
  handleUpsertTasks(updatedTasks as any, store)
}

const EndCheckInMutation: StandardMutation<TEndCheckInMutation, HistoryMaybeLocalHandler> = (
  atmosphere,
  variables,
  {onError, onCompleted, history}
) => {
  return commitMutation<TEndCheckInMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('endCheckIn')
      if (!payload) return
      const context = {atmosphere, store: store as any}
      endCheckInNotificationUpdater(payload, context)
      endCheckInTeamUpdater(payload, context)
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      endCheckInTeamOnNext(res.endCheckIn, {atmosphere, history})
    },
    onError
  })
}

export default EndCheckInMutation

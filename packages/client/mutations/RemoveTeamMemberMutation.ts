import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {
  OnNextHandler,
  OnNextHistoryContext,
  SharedUpdater,
  SimpleMutation
} from '../types/relayMutations'
import onMeetingRoute from '../utils/onMeetingRoute'
import onTeamRoute from '../utils/onTeamRoute'
import {RemoveTeamMemberMutation as TRemoveTeamMemberMutation} from '../__generated__/RemoveTeamMemberMutation.graphql'
import {RemoveTeamMemberMutation_task$data} from '../__generated__/RemoveTeamMemberMutation_task.graphql'
import {RemoveTeamMemberMutation_team$data} from '../__generated__/RemoveTeamMemberMutation_team.graphql'
import handleAddNotifications from './handlers/handleAddNotifications'
import handleRemoveTasks from './handlers/handleRemoveTasks'
import handleRemoveTeamMembers from './handlers/handleRemoveTeamMembers'
import handleRemoveTeams from './handlers/handleRemoveTeams'
import handleUpsertTasks from './handlers/handleUpsertTasks'
import SetNotificationStatusMutation from './SetNotificationStatusMutation'

graphql`
  fragment RemoveTeamMemberMutation_task on RemoveTeamMemberPayload {
    updatedTasks {
      id
      tags
      user {
        id
        preferredName
        picture
      }
      userId
    }
  }
`

graphql`
  fragment RemoveTeamMemberMutation_teamTeam on Team {
    id
    activeMeetings {
      facilitatorStageId
      facilitatorUserId
      meetingMembers {
        id
      }
      phases {
        stages {
          id
          readyCount
        }
      }
    }
  }
`

graphql`
  fragment RemoveTeamMemberMutation_team on RemoveTeamMemberPayload {
    updatedTasks {
      id
    }
    kickOutNotification {
      id
      type
      team {
        id
        name
        activeMeetings {
          id
        }
      }
      ...KickedOut_notification
    }
    team {
      ...RemoveTeamMemberMutation_teamTeam @relay(mask: false)
    }
    teamMember {
      id
      userId
    }
  }
`

const mutation = graphql`
  mutation RemoveTeamMemberMutation($teamMemberId: ID!) {
    removeTeamMember(teamMemberId: $teamMemberId) {
      error {
        message
      }
      ...RemoveTeamMemberMutation_task @relay(mask: false)
      ...RemoveTeamMemberMutation_team @relay(mask: false)
    }
  }
`

export const removeTeamMemberTeamOnNext: OnNextHandler<
  RemoveTeamMemberMutation_team$data,
  OnNextHistoryContext
> = (payload, {atmosphere, history}) => {
  if (!payload) return
  const {kickOutNotification} = payload
  if (!kickOutNotification) return
  const {team, id: notificationId} = kickOutNotification
  const {id: teamId, activeMeetings, name: teamName} = team
  if (!teamId) return
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: `removedFromTeam:${teamId}`,
    autoDismiss: 10,
    message: `You have been removed from ${teamName}`,
    action: {
      label: 'OK',
      callback: () => {
        SetNotificationStatusMutation(
          atmosphere,
          {
            notificationId,
            status: 'CLICKED'
          },
          {}
        )
      }
    }
  })
  const meetingIds = activeMeetings.map(({id}) => id)
  if (
    onTeamRoute(window.location.pathname, teamId) ||
    onMeetingRoute(window.location.pathname, meetingIds)
  ) {
    history.push('/meetings')
  }
}

export const removeTeamMemberTasksUpdater: SharedUpdater<RemoveTeamMemberMutation_task$data> = (
  payload,
  {store}
) => {
  const tasks = payload.getLinkedRecords('updatedTasks')
  // FIXME: noImplcitAny found this as a bug, it probably is! The fix will be a little too involved to include in this linting PR
  handleUpsertTasks(tasks as any, store)
}

export const removeTeamMemberTeamUpdater: SharedUpdater<RemoveTeamMemberMutation_team$data> = (
  payload,
  {atmosphere, store}
) => {
  const removedUserId = payload.getLinkedRecord('teamMember').getValue('userId')
  const {viewerId} = atmosphere
  if (removedUserId !== viewerId) {
    const teamMemberId = payload.getLinkedRecord('teamMember').getValue('id')
    handleRemoveTeamMembers(teamMemberId, store)
    return
  }
  const teamId = payload.getLinkedRecord('team').getValue('id')
  handleRemoveTeams(teamId, store)

  const notification = payload.getLinkedRecord('kickOutNotification')
  handleAddNotifications(notification, store)

  const removedTasks = payload.getLinkedRecords('updatedTasks')
  if (!removedTasks) return
  const taskIds = removedTasks.map((task) => task.getValue('id'))
  handleRemoveTasks(taskIds, store)
}

export const removeTeamMemberUpdater: SharedUpdater<any> = (payload, context) => {
  removeTeamMemberTasksUpdater(payload, context)
  removeTeamMemberTeamUpdater(payload, context)
}

const RemoveTeamMemberMutation: SimpleMutation<TRemoveTeamMemberMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<TRemoveTeamMemberMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('removeTeamMember')
      if (!payload) return
      removeTeamMemberUpdater(payload, {atmosphere, store})
    }
  })
}

export default RemoveTeamMemberMutation

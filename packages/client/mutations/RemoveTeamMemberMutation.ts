import {commitMutation, graphql} from 'react-relay'
import ClearNotificationMutation from './ClearNotificationMutation'
import handleAddNotifications from './handlers/handleAddNotifications'
import handleRemoveNotifications from './handlers/handleRemoveNotifications'
import handleRemoveTeamMembers from './handlers/handleRemoveTeamMembers'
import handleRemoveTeams from './handlers/handleRemoveTeams'
import handleUpsertTasks from './handlers/handleUpsertTasks'
import getInProxy from '../utils/relay/getInProxy'
import handleRemoveTasks from './handlers/handleRemoveTasks'
import onTeamRoute from '../utils/onTeamRoute'
import {RemoveTeamMemberMutation_team} from '../../__generated__/RemoveTeamMemberMutation_team.graphql'
import {OnNextHandler} from '../types/relayMutations'

graphql`
  fragment RemoveTeamMemberMutation_task on RemoveTeamMemberPayload {
    updatedTasks {
      id
      tags
      assigneeId
      assignee {
        id
        preferredName
        ... on TeamMember {
          picture
        }
      }
      userId
    }
  }
`

graphql`
  fragment RemoveTeamMemberMutation_teamTeam on Team {
    id
    newMeeting {
      facilitatorStageId
      facilitatorUserId
      meetingMembers {
        id
      }
      phases {
        stages {
          id
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
    removedNotifications {
      id
    }
    kickOutNotification {
      id
      type
      ...KickedOut_notification @relay(mask: false)
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

export const removeTeamMemberTeamOnNext: OnNextHandler<RemoveTeamMemberMutation_team> = (
  payload,
  {atmosphere, history}
) => {
  if (!payload) return
  const {kickOutNotification} = payload
  if (!kickOutNotification) return
  const {
    team: {id: teamId, name: teamName},
    id: notificationId
  } = kickOutNotification
  if (!teamId) return
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: `removedFromTeam:${teamId}`,
    autoDismiss: 10,
    message: `You have been removed from ${teamName}`,
    action: {
      label: 'OK',
      callback: () => {
        ClearNotificationMutation(atmosphere, notificationId)
      }
    }
  })
  if (onTeamRoute(window.location.pathname, teamId)) {
    history && history.push('/me')
  }
}

export const removeTeamMemberTasksUpdater = (payload, store) => {
  const tasks = payload.getLinkedRecords('updatedTasks')
  handleUpsertTasks(tasks, store)
}

export const removeTeamMemberTeamUpdater = (payload, store, viewerId) => {
  const removedUserId = getInProxy(payload, 'teamMember', 'userId')
  if (removedUserId !== viewerId) {
    const teamMemberId = getInProxy(payload, 'teamMember', 'id')
    handleRemoveTeamMembers(teamMemberId, store)
    return
  }
  const removedNotifications = payload.getLinkedRecords('removedNotifications')
  const notificationIds = getInProxy(removedNotifications, 'id')
  handleRemoveNotifications(notificationIds, store)

  const teamId = getInProxy(payload, 'team', 'id')
  handleRemoveTeams(teamId, store, viewerId)

  const notification = payload.getLinkedRecord('kickOutNotification')
  handleAddNotifications(notification, store)

  const removedTasks = payload.getLinkedRecords('updatedTasks')
  const taskIds = getInProxy(removedTasks, 'id')
  handleRemoveTasks(taskIds, store, viewerId)
}

export const removeTeamMemberUpdater = (payload, store, viewerId) => {
  removeTeamMemberTasksUpdater(payload, store)
  removeTeamMemberTeamUpdater(payload, store, viewerId)
}

const RemoveTeamMemberMutation = (environment, teamMemberId) => {
  const {viewerId} = environment
  return commitMutation(environment, {
    mutation,
    variables: {teamMemberId},
    updater: (store) => {
      const payload = store.getRootField('removeTeamMember')
      if (!payload) return
      removeTeamMemberUpdater(payload, store, viewerId)
    }
  })
}

export default RemoveTeamMemberMutation

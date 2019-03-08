import {commitMutation} from 'react-relay'
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications'
import handleRemoveTeamMembers from 'universal/mutations/handlers/handleRemoveTeamMembers'
import handleRemoveTeams from 'universal/mutations/handlers/handleRemoveTeams'
import handleUpsertTasks from 'universal/mutations/handlers/handleUpsertTasks'
import getInProxy from 'universal/utils/relay/getInProxy'
import handleRemoveTasks from 'universal/mutations/handlers/handleRemoveTasks'
import onTeamRoute from 'universal/utils/onTeamRoute'

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
  fragment RemoveTeamMemberMutation_teamMember on RemoveTeamMemberPayload {
    teamMember {
      id
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
      id
      newMeeting {
        phases {
          stages {
            id
          }
        }
      }
    }
    teamMember {
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
      ...RemoveTeamMemberMutation_teamMember @relay(mask: false)
      ...RemoveTeamMemberMutation_task @relay(mask: false)
      ...RemoveTeamMemberMutation_team @relay(mask: false)
    }
  }
`

const popKickedOutNotification = (payload, {atmosphere, history}) => {
  if (!payload) return
  const {kickOutNotification} = payload
  if (!kickOutNotification) return
  const {
    team: {id: teamId, name: teamName},
    id: notificationId
  } = kickOutNotification
  if (!teamId) return
  atmosphere.eventEmitter.emit('addToast', {
    level: 'warning',
    autoDismiss: 10,
    title: 'So long!',
    message: `You have been removed from ${teamName}`,
    action: {
      label: 'OK',
      callback: () => {
        ClearNotificationMutation(atmosphere, notificationId)
      }
    }
  })
  const {pathname} = history.location
  if (onTeamRoute(pathname, teamId)) {
    history.push('/me')
  }
}

export const removeTeamMemberTeamOnNext = (payload, {atmosphere, history}) => {
  popKickedOutNotification(payload, {atmosphere, history})
}

export const removeTeamMemberTasksUpdater = (payload, store, viewerId) => {
  const tasks = payload.getLinkedRecords('updatedTasks')
  handleUpsertTasks(tasks, store, viewerId)
}

export const removeTeamMemberTeamMemberUpdater = (payload, store) => {
  const teamMemberId = getInProxy(payload, 'teamMember', 'id')
  handleRemoveTeamMembers(teamMemberId, store)
}

export const removeTeamMemberTeamUpdater = (payload, store, viewerId) => {
  const removedUserId = getInProxy(payload, 'teamMember', 'userId')
  if (removedUserId !== viewerId) return
  const removedNotifications = payload.getLinkedRecords('removedNotifications')
  const notificationIds = getInProxy(removedNotifications, 'id')
  handleRemoveNotifications(notificationIds, store, viewerId)

  const teamId = getInProxy(payload, 'team', 'id')
  handleRemoveTeams(teamId, store, viewerId)

  const notification = payload.getLinkedRecord('kickOutNotification')
  handleAddNotifications(notification, store, viewerId)

  const removedTasks = payload.getLinkedRecords('updatedTasks')
  const taskIds = getInProxy(removedTasks, 'id')
  handleRemoveTasks(taskIds, store, viewerId)
}

export const removeTeamMemberUpdater = (payload, store, viewerId) => {
  removeTeamMemberTeamMemberUpdater(payload, store)
  removeTeamMemberTasksUpdater(payload, store, viewerId)
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

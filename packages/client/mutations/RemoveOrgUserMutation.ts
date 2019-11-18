import {commitLocalUpdate, commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import handleAddNotifications from './handlers/handleAddNotifications'
import handleRemoveNotifications from './handlers/handleRemoveNotifications'
import handleRemoveOrganization from './handlers/handleRemoveOrganization'
import handleRemoveOrgMembers from './handlers/handleRemoveOrgMembers'
import handleRemoveTasks from './handlers/handleRemoveTasks'
import handleRemoveTeamMembers from './handlers/handleRemoveTeamMembers'
import handleRemoveTeams from './handlers/handleRemoveTeams'
import getInProxy from '../utils/relay/getInProxy'
import onTeamRoute from '../utils/onTeamRoute'
import handleUpsertTasks from './handlers/handleUpsertTasks'
import {setLocalStageAndPhase} from '../utils/relay/updateLocalStage'
import findStageById from '../utils/meetings/findStageById'
import onExOrgRoute from '../utils/onExOrgRoute'
import {OnNextHandler} from '../types/relayMutations'
import {RemoveOrgUserMutation_notification} from '../__generated__/RemoveOrgUserMutation_notification.graphql'
import {RemoveOrgUserMutation as IRemoveOrgUserMutation} from '__generated__/RemoveOrgUserMutation.graphql'

graphql`
  fragment RemoveOrgUserMutation_organization on RemoveOrgUserPayload {
    organization {
      id
    }
    user {
      id
    }
    organizationUserId
  }
`

graphql`
  fragment RemoveOrgUserMutation_notification on RemoveOrgUserPayload {
    removedTeamNotifications {
      id
    }
    removedOrgNotifications {
      id
    }
    organization {
      id
      name
    }
    kickOutNotifications {
      id
      type
      ...KickedOut_notification @relay(mask: false)
    }
  }
`

graphql`
  fragment RemoveOrgUserMutation_team on RemoveOrgUserPayload {
    teamMembers {
      id
    }
    user {
      id
    }
    teams {
      ...RemoveTeamMemberMutation_teamTeam @relay(mask: false)
    }
    user {
      id
    }
  }
`

graphql`
  fragment RemoveOrgUserMutation_task on RemoveOrgUserPayload {
    updatedTasks {
      ...CompleteTaskFrag @relay(mask: false)
    }
    user {
      id
    }
  }
`

const mutation = graphql`
  mutation RemoveOrgUserMutation($userId: ID!, $orgId: ID!) {
    removeOrgUser(userId: $userId, orgId: $orgId) {
      error {
        message
      }
      ...RemoveOrgUserMutation_organization @relay(mask: false)
      ...RemoveOrgUserMutation_team @relay(mask: false)
      ...RemoveOrgUserMutation_task @relay(mask: false)
    }
  }
`

export const removeOrgUserOrganizationUpdater = (payload, store, viewerId) => {
  const removedUserId = getInProxy(payload, 'user', 'id')
  const removedOrgUserId = getInProxy(payload, 'organizationUserId')
  const orgId = getInProxy(payload, 'organization', 'id')
  if (removedUserId === viewerId) {
    handleRemoveOrganization(orgId, store, viewerId)
  } else {
    handleRemoveOrgMembers(orgId, removedOrgUserId, store)
  }
}

export const removeOrgUserNotificationUpdater = (payload, store) => {
  const removedTeamNotifications = payload.getLinkedRecords('removedTeamNotifications')
  const teamNotificationIds = getInProxy(removedTeamNotifications, 'id')
  handleRemoveNotifications(teamNotificationIds, store)

  const removedOrgNotifications = payload.getLinkedRecords('removedOrgNotifications')
  const orgNotificationIds = getInProxy(removedOrgNotifications, 'id')
  handleRemoveNotifications(orgNotificationIds, store)

  const kickOutNotifications = payload.getLinkedRecords('kickOutNotifications')
  handleAddNotifications(kickOutNotifications, store)
}

export const removeOrgUserTeamUpdater = (payload, store, viewerId) => {
  const removedUserId = getInProxy(payload, 'user', 'id')
  if (removedUserId === viewerId) {
    const teams = payload.getLinkedRecords('teams')
    const teamIds = getInProxy(teams, 'id')
    handleRemoveTeams(teamIds, store, viewerId)
  } else {
    const teamMembers = payload.getLinkedRecords('teamMembers')
    const teamMemberIds = getInProxy(teamMembers, 'id')
    handleRemoveTeamMembers(teamMemberIds, store)
  }
}

export const removeOrgUserTaskUpdater = (payload, store, viewerId) => {
  const removedUserId = getInProxy(payload, 'user', 'id')
  const tasks = payload.getLinkedRecords('updatedTasks')
  if (removedUserId === viewerId) {
    const taskIds = getInProxy(tasks, 'id')
    handleRemoveTasks(taskIds, store)
  } else {
    handleUpsertTasks(tasks, store)
  }
}

export const removeOrgUserTeamOnNext = (payload, context) => {
  const {atmosphere} = context
  const {teams} = payload
  teams.forEach((team) => {
    const {newMeeting} = team
    if (!newMeeting) return
    const {id: meetingId, facilitatorStageId, phases} = newMeeting
    // a meeting is going on, see if the are on the removed user's phase & if so, redirect them
    commitLocalUpdate(atmosphere, (store) => {
      const meetingProxy = store.get(meetingId)
      if (!meetingProxy) return
      const viewerStageId = getInProxy(meetingProxy, 'localStage', 'id')
      const stageRes = findStageById(phases, viewerStageId)
      if (!stageRes) {
        setLocalStageAndPhase(store, meetingId, facilitatorStageId)
      }
    })
  })
}

export const removeOrgUserOrganizationOnNext = (payload, context) => {
  // FIXME currently, the server doesn't send this to the user in other tabs, so they don't get redirected in their other tabs
  const {
    atmosphere: {viewerId},
    history
  } = context
  const {pathname} = history.location
  const {
    user: {id: userId},
    organization: {id: orgId}
  } = payload
  if (userId === viewerId && onExOrgRoute(pathname, orgId)) {
    history.push('/me')
  }
}

export const removeOrgUserNotificationOnNext: OnNextHandler<RemoveOrgUserMutation_notification> = (
  payload,
  {atmosphere, history}
) => {
  if (!payload) return
  const {organization, kickOutNotifications} = payload
  if (!organization || !kickOutNotifications) return
  const {name: orgName, id: orgId} = organization
  const teamIds = kickOutNotifications.map((notification) => notification && notification.team.id)
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: `removedFromOrg:${orgId}`,
    autoDismiss: 10,
    message: `You have been removed from ${orgName} and all its teams`
  })

  for (let ii = 0; ii < teamIds.length; ii++) {
    const teamId = teamIds[ii]
    if (onTeamRoute(window.location.pathname, teamId)) {
      history && history.push('/me')
      return
    }
  }
}

const RemoveOrgUserMutation = (atmosphere, variables, context, onError, onCompleted) => {
  const {viewerId} = atmosphere
  return commitMutation<IRemoveOrgUserMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('removeOrgUser')
      if (!payload) return
      removeOrgUserOrganizationUpdater(payload, store, viewerId)
      removeOrgUserTeamUpdater(payload, store, viewerId)
      removeOrgUserTaskUpdater(payload, store, viewerId)
    },
    // optimisticUpdater: (store) => {
    //   const {orgId, userId} = variables;
    //   const {viewerId} = atmosphere;
    //   if (viewerId === userId) {
    //     handleRemoveOrganization(orgId, store, viewerId);
    //   }
    // },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }

      removeOrgUserOrganizationOnNext(res.removeOrgUser, {
        ...context,
        atmosphere
      })
    },
    onError
  })
}

export default RemoveOrgUserMutation

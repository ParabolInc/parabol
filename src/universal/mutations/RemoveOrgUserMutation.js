import {commitLocalUpdate, commitMutation} from 'react-relay'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications'
import handleRemoveOrganization from 'universal/mutations/handlers/handleRemoveOrganization'
import handleRemoveOrgMembers from 'universal/mutations/handlers/handleRemoveOrgMembers'
import handleRemoveTasks from 'universal/mutations/handlers/handleRemoveTasks'
import handleRemoveTeamMembers from 'universal/mutations/handlers/handleRemoveTeamMembers'
import handleRemoveTeams from 'universal/mutations/handlers/handleRemoveTeams'
import getInProxy from 'universal/utils/relay/getInProxy'
import onTeamRoute from 'universal/utils/onTeamRoute'
import handleUpsertTasks from 'universal/mutations/handlers/handleUpsertTasks'
import {setLocalStageAndPhase} from 'universal/utils/relay/updateLocalStage'
import findStageById from 'universal/utils/meetings/findStageById'
import onExOrgRoute from 'universal/utils/onExOrgRoute'

graphql`
  fragment RemoveOrgUserMutation_organization on RemoveOrgUserPayload {
    organization {
      id
    }
    user {
      id
    }
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
    teams {
      id
      # wildly wasteful in terms of overfetching, but no handler required
      newMeeting {
        ...CompleteNewMeetingFrag @relay(mask: false)
      }
    }
    user {
      id
    }
  }
`

graphql`
  fragment RemoveOrgUserMutation_teamMember on RemoveOrgUserPayload {
    teamMembers {
      id
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
      ...RemoveOrgUserMutation_teamMember @relay(mask: false)
      ...RemoveOrgUserMutation_task @relay(mask: false)
    }
  }
`

const popKickedOutToast = (payload, {atmosphere, history}) => {
  if (!payload) return
  const {organization, kickOutNotifications} = payload
  if (!organization || !kickOutNotifications) return
  const {name: orgName} = organization
  const teamIds = kickOutNotifications.map((notification) => notification.team.id)
  atmosphere.eventEmitter.emit('addToast', {
    level: 'warning',
    autoDismiss: 10,
    title: 'So long!',
    message: `You have been removed from ${orgName} and all its teams`
  })

  const {pathname} = history.location
  for (let ii = 0; ii < teamIds.length; ii++) {
    const teamId = teamIds[ii]
    if (onTeamRoute(pathname, teamId)) {
      history.push('/me')
      return
    }
  }
}

export const removeOrgUserOrganizationUpdater = (payload, store, viewerId) => {
  const removedUserId = getInProxy(payload, 'user', 'id')
  const orgId = getInProxy(payload, 'organization', 'id')
  if (removedUserId === viewerId) {
    handleRemoveOrganization(orgId, store, viewerId)
  } else {
    handleRemoveOrgMembers(orgId, removedUserId, store)
  }
}

export const removeOrgUserNotificationUpdater = (payload, store, viewerId) => {
  const removedTeamNotifications = payload.getLinkedRecords('removedTeamNotifications')
  const teamNotificationIds = getInProxy(removedTeamNotifications, 'id')
  handleRemoveNotifications(teamNotificationIds, store, viewerId)

  const removedOrgNotifications = payload.getLinkedRecords('removedOrgNotifications')
  const orgNotificationIds = getInProxy(removedOrgNotifications, 'id')
  handleRemoveNotifications(orgNotificationIds, store, viewerId)

  const kickOutNotifications = payload.getLinkedRecords('kickOutNotifications')
  handleAddNotifications(kickOutNotifications, store, viewerId)
}

export const removeOrgUserTeamUpdater = (payload, store, viewerId) => {
  const removedUserId = getInProxy(payload, 'user', 'id')
  if (removedUserId === viewerId) {
    const teams = payload.getLinkedRecords('teams')
    const teamIds = getInProxy(teams, 'id')
    handleRemoveTeams(teamIds, store, viewerId)
  }
}

export const removeOrgUserTeamMemberUpdater = (payload, store) => {
  const teamMembers = payload.getLinkedRecords('teamMembers')
  const teamMemberIds = getInProxy(teamMembers, 'id')
  handleRemoveTeamMembers(teamMemberIds, store)
}

export const removeOrgUserTaskUpdater = (payload, store, viewerId) => {
  const removedUserId = getInProxy(payload, 'user', 'id')
  const tasks = payload.getLinkedRecords('updatedTasks')
  if (removedUserId === viewerId) {
    const taskIds = getInProxy(tasks, 'id')
    handleRemoveTasks(taskIds, store, viewerId)
  } else {
    handleUpsertTasks(tasks, store, viewerId)
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

export const removeOrgUserNotificationOnNext = (payload, {atmosphere, history, location}) => {
  popKickedOutToast(payload, {atmosphere, history, location})
}

const RemoveOrgUserMutation = (atmosphere, variables, context, onError, onCompleted) => {
  const {viewerId} = atmosphere
  return commitMutation(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('removeOrgUser')
      if (!payload) return
      removeOrgUserOrganizationUpdater(payload, store, viewerId)
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

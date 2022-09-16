import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, commitMutation} from 'react-relay'
import {RemoveOrgUserMutation as TRemoveOrgUserMutation} from '~/__generated__/RemoveOrgUserMutation.graphql'
import {RemoveOrgUserMutation_team} from '~/__generated__/RemoveOrgUserMutation_team.graphql'
import {
  HistoryLocalHandler,
  OnNextHandler,
  OnNextHistoryContext,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import findStageById from '../utils/meetings/findStageById'
import onExOrgRoute from '../utils/onExOrgRoute'
import onMeetingRoute from '../utils/onMeetingRoute'
import onTeamRoute from '../utils/onTeamRoute'
import {setLocalStageAndPhase} from '../utils/relay/updateLocalStage'
import {RemoveOrgUserMutation_notification} from '../__generated__/RemoveOrgUserMutation_notification.graphql'
import {RemoveOrgUserMutation_organization} from '../__generated__/RemoveOrgUserMutation_organization.graphql'
import {RemoveOrgUserMutation_task} from '../__generated__/RemoveOrgUserMutation_task.graphql'
import handleAddNotifications from './handlers/handleAddNotifications'
import handleRemoveOrganization from './handlers/handleRemoveOrganization'
import handleRemoveOrgMembers from './handlers/handleRemoveOrgMembers'
import handleRemoveTasks from './handlers/handleRemoveTasks'
import handleRemoveTeamMembers from './handlers/handleRemoveTeamMembers'
import handleRemoveTeams from './handlers/handleRemoveTeams'
import handleUpsertTasks from './handlers/handleUpsertTasks'

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
    organization {
      id
      name
    }
    kickOutNotifications {
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
      activeMeetings {
        id
      }
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

export const removeOrgUserOrganizationUpdater: SharedUpdater<RemoveOrgUserMutation_organization> = (
  payload,
  {atmosphere, store}
) => {
  const {viewerId} = atmosphere
  const removedUserId = payload.getLinkedRecord('user').getValue('id')
  const removedOrgUserId = payload.getValue('organizationUserId')
  const orgId = payload.getLinkedRecord('organization').getValue('id')
  if (removedUserId === viewerId) {
    handleRemoveOrganization(orgId, store)
  } else {
    handleRemoveOrgMembers(orgId, removedOrgUserId, store)
  }
}

export const removeOrgUserNotificationUpdater: SharedUpdater<RemoveOrgUserMutation_notification> = (
  payload,
  {store}
) => {
  const kickOutNotifications = payload.getLinkedRecords('kickOutNotifications')
  handleAddNotifications(kickOutNotifications, store)
}

export const removeOrgUserTeamUpdater: SharedUpdater<RemoveOrgUserMutation_team> = (
  payload,
  {atmosphere, store}
) => {
  const removedUserId = payload.getLinkedRecord('user').getValue('id')
  const {viewerId} = atmosphere
  if (removedUserId === viewerId) {
    const teams = payload.getLinkedRecords('teams')
    const teamIds = teams.map((team) => team.getValue('id'))
    handleRemoveTeams(teamIds, store)
  } else {
    const teamMembers = payload.getLinkedRecords('teamMembers')
    const teamMemberIds = teamMembers.map((teamMember) => teamMember.getValue('id'))
    handleRemoveTeamMembers(teamMemberIds, store)
  }
}

export const removeOrgUserTaskUpdater: SharedUpdater<RemoveOrgUserMutation_task> = (
  payload,
  {atmosphere, store}
) => {
  const removedUserId = payload.getLinkedRecord('user').getValue('id')
  const tasks = payload.getLinkedRecords('updatedTasks')
  if (removedUserId === atmosphere.viewerId) {
    const taskIds = tasks.map((task) => task.getValue('id'))
    handleRemoveTasks(taskIds, store)
  } else {
    handleUpsertTasks(tasks, store)
  }
}

export const removeOrgUserTeamOnNext: OnNextHandler<RemoveOrgUserMutation_team> = (
  payload,
  context
) => {
  const {atmosphere} = context
  const {teams} = payload
  if (!teams) return
  teams.forEach((team) => {
    const {activeMeetings} = team
    activeMeetings.forEach((newMeeting) => {
      const {id: meetingId, facilitatorStageId, phases} = newMeeting
      // a meeting is going on, see if the are on the removed user's phase & if so, redirect them
      commitLocalUpdate(atmosphere, (store) => {
        const meetingProxy = store.get(meetingId)
        if (!meetingProxy) return
        const viewerStageId = meetingProxy.getLinkedRecord('localStage')!.getValue('id') as string
        const stageRes = findStageById(phases, viewerStageId)
        if (!stageRes) {
          setLocalStageAndPhase(store, meetingId, facilitatorStageId)
        }
      })
    })
  })
}

export const removeOrgUserOrganizationOnNext: OnNextHandler<
  RemoveOrgUserMutation_organization,
  OnNextHistoryContext
> = (payload, context) => {
  // FIXME currently, the server doesn't send this to the user in other tabs, so they don't get redirected in their other tabs
  const {
    atmosphere: {viewerId},
    history
  } = context
  const {pathname} = history.location
  const {user, organization} = payload
  const userId = user?.id
  const orgId = organization?.id ?? ''
  if (userId === viewerId && onExOrgRoute(pathname, orgId)) {
    history.push('/meetings')
  }
}

export const removeOrgUserNotificationOnNext: OnNextHandler<
  RemoveOrgUserMutation_notification,
  OnNextHistoryContext
> = (payload, {atmosphere, history}) => {
  if (!payload) return
  const {organization, kickOutNotifications} = payload
  if (!organization || !kickOutNotifications) return
  const {name: orgName, id: orgId} = organization
  const teams = kickOutNotifications.map((notification) => notification && notification.team)
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: `removedFromOrg:${orgId}`,
    autoDismiss: 10,
    message: `You have been removed from ${orgName} and all its teams`
  })

  for (let ii = 0; ii < teams.length; ii++) {
    const team = teams[ii]
    if (!team) continue
    const {activeMeetings, id: teamId} = team
    const meetingIds = activeMeetings.map(({id}) => id)
    if (
      onTeamRoute(window.location.pathname, teamId) ||
      onMeetingRoute(window.location.pathname, meetingIds)
    ) {
      history.push('/meetings')
      return
    }
  }
}

const RemoveOrgUserMutation: StandardMutation<TRemoveOrgUserMutation, HistoryLocalHandler> = (
  atmosphere,
  variables,
  {history, onError, onCompleted}
) => {
  return commitMutation<TRemoveOrgUserMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('removeOrgUser')
      if (!payload) return
      removeOrgUserOrganizationUpdater(payload, {atmosphere, store})
      removeOrgUserTeamUpdater(payload, {atmosphere, store})
      removeOrgUserTaskUpdater(payload, {atmosphere, store})
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      if (!res.removeOrgUser) return
      removeOrgUserOrganizationOnNext(res.removeOrgUser, {
        history,
        atmosphere
      })
    },
    onError
  })
}

export default RemoveOrgUserMutation

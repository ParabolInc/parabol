import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, commitMutation} from 'react-relay'
import {RecordProxy} from 'relay-runtime'
import {RemoveMultipleOrgUsersMutation as TRemoveMultipleOrgUsersMutation} from '~/__generated__/RemoveMultipleOrgUsersMutation.graphql'
import {RemoveMultipleOrgUsersMutation_organization$data} from '~/__generated__/RemoveMultipleOrgUsersMutation_organization.graphql'
import {RemoveMultipleOrgUsersMutation_notification$data} from '../__generated__/RemoveMultipleOrgUsersMutation_notification.graphql'
import {RemoveMultipleOrgUsersMutation_task$data} from '../__generated__/RemoveMultipleOrgUsersMutation_task.graphql'
import {RemoveMultipleOrgUsersMutation_team$data} from '../__generated__/RemoveMultipleOrgUsersMutation_team.graphql'
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
import handleAddNotifications from './handlers/handleAddNotifications'
import handleRemoveOrgMembers from './handlers/handleRemoveOrgMembers'
import handleRemoveOrganization from './handlers/handleRemoveOrganization'
import handleRemoveTasks from './handlers/handleRemoveTasks'
import handleRemoveTeamMembers from './handlers/handleRemoveTeamMembers'
import handleRemoveTeams from './handlers/handleRemoveTeams'
import handleUpsertTasks from './handlers/handleUpsertTasks'

graphql`
  fragment RemoveMultipleOrgUsersMutation_organization on RemoveMultipleOrgUsersSuccess {
    organization {
      id
    }
    users {
      id
    }
    removedOrgMembers {
      id
    }
  }
`

graphql`
  fragment RemoveMultipleOrgUsersMutation_notification on RemoveMultipleOrgUsersSuccess {
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
  fragment RemoveMultipleOrgUsersMutation_team on RemoveMultipleOrgUsersSuccess {
    teamMembers {
      id
    }
    users {
      id
    }
    teams {
      ...RemoveTeamMemberMutation_teamTeam @relay(mask: false)
      activeMeetings {
        id
      }
    }
  }
`

graphql`
  fragment RemoveMultipleOrgUsersMutation_task on RemoveMultipleOrgUsersSuccess {
    updatedTasks {
      ...CompleteTaskFrag @relay(mask: false)
    }
    users {
      id
    }
  }
`

const mutation = graphql`
  mutation RemoveMultipleOrgUsersMutation($userIds: [ID!]!, $orgId: ID!) {
    removeMultipleOrgUsers(userIds: $userIds, orgId: $orgId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on RemoveMultipleOrgUsersSuccess {
        ...RemoveMultipleOrgUsersMutation_organization @relay(mask: false)
        ...RemoveMultipleOrgUsersMutation_team @relay(mask: false)
        ...RemoveMultipleOrgUsersMutation_task @relay(mask: false)
        ...RemoveMultipleOrgUsersMutation_notification @relay(mask: false)
      }
    }
  }
`

export const removeMultipleOrgUsersOrganizationUpdater: SharedUpdater<
  RemoveMultipleOrgUsersMutation_organization$data
> = (payload, {atmosphere, store}) => {
  const {viewerId} = atmosphere
  const users = payload.getLinkedRecords('users')
  const removedOrgMembers = payload.getLinkedRecords('removedOrgMembers')
  const orgId = payload.getLinkedRecord('organization').getValue('id')

  if (users.some((user) => user.getValue('id') === viewerId)) {
    handleRemoveOrganization(orgId, store)
  } else {
    removedOrgMembers.forEach((member) => {
      handleRemoveOrgMembers(orgId, member.getValue('id'), store)
    })
  }
}

export const removeMultipleOrgUsersNotificationUpdater: SharedUpdater<
  RemoveMultipleOrgUsersMutation_notification$data
> = (payload, {store}) => {
  const kickOutNotifications = payload.getLinkedRecords('kickOutNotifications')
  handleAddNotifications(kickOutNotifications, store)
}

export const removeMultipleOrgUsersTeamUpdater: SharedUpdater<
  RemoveMultipleOrgUsersMutation_team$data
> = (payload, {atmosphere, store}) => {
  const users = payload.getLinkedRecords('users')
  const {viewerId} = atmosphere

  if (users.some((user) => user.getValue('id') === viewerId)) {
    const teams = payload.getLinkedRecords('teams')
    const teamIds = teams.map((team) => team.getValue('id'))
    handleRemoveTeams(teamIds, store)
  } else {
    const teamMembers = payload.getLinkedRecords('teamMembers')
    const teamMemberIds = teamMembers?.map((teamMember) => teamMember.getValue('id'))
    handleRemoveTeamMembers(teamMemberIds, store)
  }
}

export const removeMultipleOrgUsersTaskUpdater: SharedUpdater<
  RemoveMultipleOrgUsersMutation_task$data
> = (payload, {atmosphere, store}) => {
  const users = payload.getLinkedRecords('users')
  const tasks = payload.getLinkedRecords('updatedTasks')
  if (!tasks) return

  if (users.some((user) => user.getValue('id') === atmosphere.viewerId)) {
    const taskIds = tasks.map((task) => task.getValue('id'))
    handleRemoveTasks(taskIds, store)
  } else {
    handleUpsertTasks(tasks, store)
  }
}

export const removeMultipleOrgUsersTeamOnNext: OnNextHandler<
  RemoveMultipleOrgUsersMutation_team$data
> = (payload, context) => {
  const {atmosphere} = context
  const {teams} = payload
  if (!teams) return
  teams.forEach((team) => {
    const {activeMeetings} = team
    activeMeetings.forEach((newMeeting) => {
      const {id: meetingId, facilitatorStageId, phases} = newMeeting
      commitLocalUpdate(atmosphere, (store) => {
        const meetingProxy = store.get(meetingId)
        if (!meetingProxy) return
        const localStage = meetingProxy.getLinkedRecord('localStage')
        if (!localStage) return
        const viewerStageId = localStage.getValue('id') as string
        const stageRes = findStageById(phases, viewerStageId)
        if (!stageRes) {
          setLocalStageAndPhase(store, meetingId, facilitatorStageId)
        }
      })
    })
  })
}

export const removeMultipleOrgUsersOrganizationOnNext: OnNextHandler<
  RemoveMultipleOrgUsersMutation_organization$data,
  OnNextHistoryContext
> = (payload, context) => {
  const {
    atmosphere: {viewerId},
    history
  } = context
  const {pathname} = history.location
  const {users, organization} = payload
  const orgId = organization?.id ?? ''
  if (users.some((user) => user.id === viewerId) && onExOrgRoute(pathname, orgId)) {
    history.push('/meetings')
  }
}

export const removeMultipleOrgUsersNotificationOnNext: OnNextHandler<
  RemoveMultipleOrgUsersMutation_notification$data,
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

const RemoveMultipleOrgUsersMutation: StandardMutation<
  TRemoveMultipleOrgUsersMutation,
  HistoryLocalHandler
> = (atmosphere, variables, {history, onError, onCompleted}) => {
  return commitMutation<TRemoveMultipleOrgUsersMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('removeMultipleOrgUsers')
      if (!payload) return
      if (payload.getValue('error')) return
      const success = payload.getLinkedRecord('RemoveMultipleOrgUsersSuccess')
      if (!success) return

      const organizationSuccess =
        success as RecordProxy<RemoveMultipleOrgUsersMutation_organization$data>
      const teamSuccess = success as RecordProxy<RemoveMultipleOrgUsersMutation_team$data>
      const taskSuccess = success as RecordProxy<RemoveMultipleOrgUsersMutation_task$data>
      const notificationSuccess =
        success as RecordProxy<RemoveMultipleOrgUsersMutation_notification$data>

      removeMultipleOrgUsersOrganizationUpdater(organizationSuccess, {atmosphere, store})
      removeMultipleOrgUsersTeamUpdater(teamSuccess, {atmosphere, store})
      removeMultipleOrgUsersTaskUpdater(taskSuccess, {atmosphere, store})
      removeMultipleOrgUsersNotificationUpdater(notificationSuccess, {atmosphere, store})
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      const payload = res.removeMultipleOrgUsers
      if (!payload || !('success' in payload)) return
      const {success} = payload
      if (!success) return

      const organizationSuccess = success as RemoveMultipleOrgUsersMutation_organization$data
      const teamSuccess = success as RemoveMultipleOrgUsersMutation_team$data
      const notificationSuccess = success as RemoveMultipleOrgUsersMutation_notification$data

      removeMultipleOrgUsersOrganizationOnNext(organizationSuccess, {
        history,
        atmosphere
      })
      removeMultipleOrgUsersTeamOnNext(teamSuccess, {atmosphere})
      removeMultipleOrgUsersNotificationOnNext(notificationSuccess, {atmosphere, history})
    },
    onError
  })
}

export default RemoveMultipleOrgUsersMutation

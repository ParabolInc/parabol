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
import handleRemoveOrganization from './handlers/handleRemoveOrganization'
import handleRemoveOrgMembers from './handlers/handleRemoveOrgMembers'
import handleRemoveTeamMembers from './handlers/handleRemoveTeamMembers'
import handleRemoveTeams from './handlers/handleRemoveTeams'
import handleTasksForRemovedUsers from './handlers/handleTasksForRemovedUsers'
graphql`
  fragment RemoveMultipleOrgUsersMutation_organization on RemoveMultipleOrgUsersSuccess {
    affectedOrganizationId
    affectedOrganizationName
    removedOrgMemberIds
    removedUserIds
  }
`

graphql`
  fragment RemoveMultipleOrgUsersMutation_notification on RemoveMultipleOrgUsersSuccess {
    affectedOrganizationId
    affectedOrganizationName
    kickOutNotifications {
      id
      type
      ...KickedOut_notification
    }
    affectedTeamIds
    affectedMeetingIds
  }
`

graphql`
  fragment RemoveMultipleOrgUsersMutation_team on RemoveMultipleOrgUsersSuccess {
    removedTeamMemberIds
    removedUserIds
    affectedTeamIds
    affectedMeetings {
      id
      facilitatorStageId
      phases {
        id
        stages {
          id
        }
      }
    }
  }
`

graphql`
  fragment RemoveMultipleOrgUsersMutation_task on RemoveMultipleOrgUsersSuccess {
    affectedTasks {
      ...CompleteTaskFrag @relay(mask: false)
    }
    removedUserIds
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
  const removedOrgMemberIds = payload.getValue('removedOrgMemberIds')
  const affectedOrganizationId = payload.getValue('affectedOrganizationId')
  const removedUserIds = payload.getValue('removedUserIds')
  const {viewerId} = atmosphere

  if (removedUserIds.some((removedUserId) => removedUserId === viewerId)) {
    handleRemoveOrganization(affectedOrganizationId, store)
  } else {
    removedOrgMemberIds.forEach((removedOrgMemberId) => {
      handleRemoveOrgMembers(affectedOrganizationId, removedOrgMemberId, store)
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
  const removedUserIds = payload.getValue('removedUserIds')
  const {viewerId} = atmosphere

  if (removedUserIds.some((removedUserId) => removedUserId === viewerId)) {
    const affectedTeamIds = payload.getValue('affectedTeamIds')
    handleRemoveTeams(affectedTeamIds, store)
  } else {
    const removedTeamMemberIds = payload.getValue('removedTeamMemberIds')
    handleRemoveTeamMembers(removedTeamMemberIds, store)
  }
}

export const removeMultipleOrgUsersTaskUpdater: SharedUpdater<
  RemoveMultipleOrgUsersMutation_task$data
> = (payload, {atmosphere, store}) => {
  const tasks = payload.getLinkedRecords('affectedTasks')
  const removedUserIds = payload.getValue('removedUserIds') as string[]
  const {viewerId} = atmosphere
  handleTasksForRemovedUsers(tasks, removedUserIds, viewerId, store)
}

export const removeMultipleOrgUsersTeamOnNext: OnNextHandler<
  RemoveMultipleOrgUsersMutation_team$data
> = (payload, context) => {
  const {atmosphere} = context
  const {affectedMeetings} = payload
  affectedMeetings.forEach((newMeeting) => {
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
  const {removedUserIds, affectedOrganizationId} = payload
  if (
    removedUserIds.some((removedUserId) => removedUserId === viewerId) &&
    onExOrgRoute(pathname, affectedOrganizationId)
  ) {
    history.push('/meetings')
  }
}

export const removeMultipleOrgUsersNotificationOnNext: OnNextHandler<
  RemoveMultipleOrgUsersMutation_notification$data,
  OnNextHistoryContext
> = (payload, {atmosphere, history}) => {
  if (!payload) return
  const {affectedOrganizationId, affectedOrganizationName, affectedMeetingIds, affectedTeamIds} =
    payload
  if (!affectedOrganizationId || !affectedOrganizationName) return
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: `removedFromOrg:${affectedOrganizationId}`,
    autoDismiss: 10,
    message: `You have been removed from ${affectedOrganizationName} and all its teams`
  })

  if (onMeetingRoute(window.location.pathname, affectedMeetingIds)) {
    history.push('/meetings')
    return
  }
  if (affectedTeamIds.some((teamId) => onTeamRoute(window.location.pathname, teamId))) {
    history.push('/meetings')
    return
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

import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, commitMutation} from 'react-relay'
import {RecordProxy} from 'relay-runtime'
import {RemoveOrgUsersMutation as TRemoveOrgUsersMutation} from '~/__generated__/RemoveOrgUsersMutation.graphql'
import {RemoveOrgUsersMutation_organization$data} from '~/__generated__/RemoveOrgUsersMutation_organization.graphql'
import {RemoveOrgUsersMutation_notification$data} from '../__generated__/RemoveOrgUsersMutation_notification.graphql'
import {RemoveOrgUsersMutation_task$data} from '../__generated__/RemoveOrgUsersMutation_task.graphql'
import {RemoveOrgUsersMutation_team$data} from '../__generated__/RemoveOrgUsersMutation_team.graphql'
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
  fragment RemoveOrgUsersMutation_organization on RemoveOrgUsersSuccess {
    affectedOrganizationId
    affectedOrganizationName
    removedOrgMemberIds
    removedUserIds
  }
`

graphql`
  fragment RemoveOrgUsersMutation_notification on RemoveOrgUsersSuccess {
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
  fragment RemoveOrgUsersMutation_team on RemoveOrgUsersSuccess {
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
  fragment RemoveOrgUsersMutation_task on RemoveOrgUsersSuccess {
    affectedTasks {
      ...CompleteTaskFrag @relay(mask: false)
    }
    removedUserIds
  }
`

const mutation = graphql`
  mutation RemoveOrgUsersMutation($userIds: [ID!]!, $orgId: ID!) {
    removeOrgUsers(userIds: $userIds, orgId: $orgId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on RemoveOrgUsersSuccess {
        ...RemoveOrgUsersMutation_organization @relay(mask: false)
        ...RemoveOrgUsersMutation_team @relay(mask: false)
        ...RemoveOrgUsersMutation_task @relay(mask: false)
        ...RemoveOrgUsersMutation_notification @relay(mask: false)
      }
    }
  }
`

export const removeOrgUsersOrganizationUpdater: SharedUpdater<
  RemoveOrgUsersMutation_organization$data
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

export const removeOrgUsersNotificationUpdater: SharedUpdater<
  RemoveOrgUsersMutation_notification$data
> = (payload, {store}) => {
  const kickOutNotifications = payload.getLinkedRecords('kickOutNotifications')
  handleAddNotifications(kickOutNotifications, store)
}

export const removeOrgUsersTeamUpdater: SharedUpdater<RemoveOrgUsersMutation_team$data> = (
  payload,
  {atmosphere, store}
) => {
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

export const removeOrgUsersTaskUpdater: SharedUpdater<RemoveOrgUsersMutation_task$data> = (
  payload,
  {atmosphere, store}
) => {
  const tasks = payload.getLinkedRecords('affectedTasks')
  const removedUserIds = payload.getValue('removedUserIds') as string[]
  const {viewerId} = atmosphere
  handleTasksForRemovedUsers(tasks, removedUserIds, viewerId, store)
}

export const removeOrgUsersTeamOnNext: OnNextHandler<RemoveOrgUsersMutation_team$data> = (
  payload,
  context
) => {
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

export const removeOrgUsersOrganizationOnNext: OnNextHandler<
  RemoveOrgUsersMutation_organization$data,
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

export const removeOrgUsersNotificationOnNext: OnNextHandler<
  RemoveOrgUsersMutation_notification$data,
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

const RemoveOrgUsersMutation: StandardMutation<TRemoveOrgUsersMutation, HistoryLocalHandler> = (
  atmosphere,
  variables,
  {history, onError, onCompleted}
) => {
  return commitMutation<TRemoveOrgUsersMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('removeOrgUsers')
      if (!payload) return
      if (payload.getValue('error')) return
      const success = payload.getLinkedRecord('RemoveOrgUsersSuccess')
      if (!success) return

      const organizationSuccess = success as RecordProxy<RemoveOrgUsersMutation_organization$data>
      const teamSuccess = success as RecordProxy<RemoveOrgUsersMutation_team$data>
      const taskSuccess = success as RecordProxy<RemoveOrgUsersMutation_task$data>
      const notificationSuccess = success as RecordProxy<RemoveOrgUsersMutation_notification$data>

      removeOrgUsersOrganizationUpdater(organizationSuccess, {atmosphere, store})
      removeOrgUsersTeamUpdater(teamSuccess, {atmosphere, store})
      removeOrgUsersTaskUpdater(taskSuccess, {atmosphere, store})
      removeOrgUsersNotificationUpdater(notificationSuccess, {atmosphere, store})
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      const payload = res.removeOrgUsers
      if (!payload || !('success' in payload)) return
      const {success} = payload
      if (!success) return

      const organizationSuccess = success as RemoveOrgUsersMutation_organization$data
      const teamSuccess = success as RemoveOrgUsersMutation_team$data
      const notificationSuccess = success as RemoveOrgUsersMutation_notification$data

      removeOrgUsersOrganizationOnNext(organizationSuccess, {
        history,
        atmosphere
      })
      removeOrgUsersTeamOnNext(teamSuccess, {atmosphere})
      removeOrgUsersNotificationOnNext(notificationSuccess, {atmosphere, history})
    },
    onError
  })
}

export default RemoveOrgUsersMutation

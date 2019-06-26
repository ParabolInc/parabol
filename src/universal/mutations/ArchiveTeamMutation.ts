import {
  ArchiveTeamMutation as TArchiveTeamMutation,
  ArchiveTeamMutationVariables
} from '__generated__/ArchiveTeamMutation.graphql'
import {ArchiveTeamMutation_team} from '__generated__/ArchiveTeamMutation_team.graphql'
import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
import onTeamRoute from 'universal/utils/onTeamRoute'
import getInProxy from 'universal/utils/relay/getInProxy'
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray'
import Atmosphere from '../Atmosphere'
import {LocalHandlers} from '../types/relayMutations'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'

graphql`
  fragment ArchiveTeamMutation_team on ArchiveTeamPayload {
    team {
      id
      name
    }
    notification {
      id
      type
      ...TeamArchived_notification
    }
  }
`

const mutation = graphql`
  mutation ArchiveTeamMutation($teamId: ID!) {
    archiveTeam(teamId: $teamId) {
      error {
        message
      }
      removedSuggestedActionIds
      ...ArchiveTeamMutation_team @relay(mask: false)
    }
  }
`

const popTeamArchivedToast = (payload: ArchiveTeamMutation_team, {history, atmosphere}) => {
  if (!payload || !payload.team) return
  const {id: teamId, name: teamName} = payload.team
  atmosphere.eventEmitter.emit('addToast', {
    level: 'info',
    autoDismiss: 10,
    title: 'That’s it, folks!',
    message: `${teamName} has been archived.`,
    action: {
      label: 'OK',
      callback: () => {
        const notificationId = payload.notification && payload.notification.id
        // notification is not persisted for the mutator
        if (notificationId) {
          ClearNotificationMutation(atmosphere, notificationId)
        }
      }
    }
  })
  const {pathname} = history.location
  if (onTeamRoute(pathname, teamId)) {
    history.push('/me')
  }
}

export const archiveTeamTeamUpdater = (payload, store, viewerId) => {
  const viewer = store.get(viewerId)
  const teamId = getInProxy(payload, 'team', 'id')
  safeRemoveNodeFromArray(teamId, viewer, 'teams')

  const notification = payload.getLinkedRecord('notification')
  handleAddNotifications(notification, store)
}

export const archiveTeamTeamOnNext = (payload: ArchiveTeamMutation_team, {atmosphere, history}) => {
  popTeamArchivedToast(payload, {atmosphere, history})
}

const ArchiveTeamMutation = (
  atmosphere: Atmosphere,
  variables: ArchiveTeamMutationVariables,
  {onError, onCompleted, history}: LocalHandlers
): Disposable => {
  const {viewerId} = atmosphere
  return commitMutation<TArchiveTeamMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('archiveTeam')
      if (!payload) return
      archiveTeamTeamUpdater(payload, store, viewerId)
      const removedSuggestedActionIds = payload.getValue('removedSuggestedActionIds')
      handleRemoveSuggestedActions(removedSuggestedActionIds, store)
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      const payload = res.archiveTeam
      if (payload) {
        popTeamArchivedToast(payload as any, {atmosphere, history})
      }
    },
    onError
  })
}

export default ArchiveTeamMutation

import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {
  HistoryLocalHandler,
  OnNextHandler,
  OnNextHistoryContext,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import onMeetingRoute from '../utils/onMeetingRoute'
import onTeamRoute from '../utils/onTeamRoute'
import safeRemoveNodeFromArray from '../utils/relay/safeRemoveNodeFromArray'
import {ArchiveOrganizationMutation as TArchiveOrganizationMutation} from '../__generated__/ArchiveOrganizationMutation.graphql'
import {ArchiveOrganizationMutation_organization$data} from '../__generated__/ArchiveOrganizationMutation_organization.graphql'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'

graphql`
  fragment ArchiveOrganizationMutation_organization on ArchiveOrganizationPayload {
    orgId
    teams {
      id
      name
      activeMeetings {
        id
      }
    }
  }
`

const mutation = graphql`
  mutation ArchiveOrganizationMutation($orgId: ID!) {
    archiveOrganization(orgId: $orgId) {
      error {
        message
      }
      removedSuggestedActionIds
      ...ArchiveOrganizationMutation_organization @relay(mask: false)
    }
  }
`

const popOrgArchivedToast: OnNextHandler<
  ArchiveOrganizationMutation_organization$data,
  OnNextHistoryContext
> = (payload, {history, atmosphere}) => {
  if (!payload) return
  const {orgId, teams} = payload
  if (!teams) return
  teams.forEach((team) => {
    const {activeMeetings, id: teamId, name: teamName} = team
    const meetingIds = activeMeetings.map(({id}) => id)
    if (
      onTeamRoute(window.location.pathname, teamId) ||
      onMeetingRoute(window.location.pathname, meetingIds)
    ) {
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: `orgArchived:${orgId}`,
        autoDismiss: 5,
        message: `${teamName} has been archived.`
      })
      history && history.push('/meetings')
    }
  })
}

export const archiveOrganizationOrganizationUpdater: SharedUpdater<
  ArchiveOrganizationMutation_organization$data
> = (payload, {store}) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')!
  const teams = payload.getLinkedRecords('teams')
  if (!teams) return

  // remove teams
  const teamIds = teams.map((team) => team.getValue('id'))
  teamIds.forEach((teamId) => {
    safeRemoveNodeFromArray(teamId as string, viewer, 'teams')
  })

  // remove org
  const orgId = payload.getValue('orgId')
  safeRemoveNodeFromArray(orgId, viewer, 'organizations')
}

export const archiveOrganizationOrganizationOnNext: OnNextHandler<
  ArchiveOrganizationMutation_organization$data,
  OnNextHistoryContext
> = (payload, {atmosphere, history}) => {
  popOrgArchivedToast(payload, {atmosphere, history})
}

const ArchiveOrganizationMutation: StandardMutation<
  TArchiveOrganizationMutation,
  HistoryLocalHandler
> = (atmosphere, variables, {onError, onCompleted, history}) => {
  return commitMutation<TArchiveOrganizationMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('archiveOrganization')
      archiveOrganizationOrganizationUpdater(payload, {atmosphere, store})
      const removedSuggestedActionIds = payload.getValue('removedSuggestedActionIds')
      handleRemoveSuggestedActions(removedSuggestedActionIds, store)
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      const payload = res.archiveOrganization
      if (payload) {
        popOrgArchivedToast(payload, {atmosphere, history})
      }
      history.replace('/meetings')
    },
    onError
  })
}

export default ArchiveOrganizationMutation

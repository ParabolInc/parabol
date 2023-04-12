import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {
  HistoryLocalHandler,
  OnNextHandler,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import getGraphQLError from '../utils/relay/getGraphQLError'
import {AddOrgMutation as TAddOrgMutation} from '../__generated__/AddOrgMutation.graphql'
import {AddOrgMutation_notification$data} from '../__generated__/AddOrgMutation_notification.graphql'
import {AddOrgMutation_organization$data} from '../__generated__/AddOrgMutation_organization.graphql'
import handleAddOrganization from './handlers/handleAddOrganization'
import handleAddTeams from './handlers/handleAddTeams'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'

graphql`
  fragment AddOrgMutation_organization on AddOrgPayload {
    organization {
      id
      isBillingLeader
      name
      orgUserCount {
        activeUserCount
        inactiveUserCount
      }
      picture
      tier
    }
    team {
      id
      name
      ...MeetingsDashActiveMeetings
      ...Team_team
    }
  }
`

graphql`
  fragment AddOrgMutation_notification on AddOrgPayload {
    removedSuggestedActionId
  }
`

const mutation = graphql`
  mutation AddOrgMutation($newTeam: NewTeamInput!, $orgName: String!) {
    addOrg(newTeam: $newTeam, orgName: $orgName) {
      error {
        message
      }
      authToken
      ...AddOrgMutation_organization @relay(mask: false)
    }
  }
`

const popOrganizationCreatedToast: OnNextHandler<AddOrgMutation_organization$data> = (
  payload,
  {atmosphere}
) => {
  const {team} = payload
  if (!team) return
  const {name: teamName, id: teamId} = team
  atmosphere.eventEmitter.emit('addSnackbar', {
    autoDismiss: 5,
    key: `orgCreated:${teamId}`,
    message: `Organization created! Here's your new team dashboard for ${teamName}`
  })
}

export const addOrgMutationOrganizationUpdater: SharedUpdater<AddOrgMutation_organization$data> = (
  payload,
  {store}
) => {
  const organization = payload.getLinkedRecord('organization')
  handleAddOrganization(organization, store)

  const team = payload.getLinkedRecord('team')
  handleAddTeams(team, store)
}

export const addOrgMutationNotificationUpdater: SharedUpdater<AddOrgMutation_notification$data> = (
  payload,
  {store}
) => {
  const removedSuggestedActionId = payload.getValue('removedSuggestedActionId')
  handleRemoveSuggestedActions(removedSuggestedActionId, store)
}

const AddOrgMutation: StandardMutation<TAddOrgMutation, HistoryLocalHandler> = (
  atmosphere,
  variables,
  {history, onError, onCompleted}
) => {
  return commitMutation<TAddOrgMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addOrg')
      if (!payload) return
      addOrgMutationOrganizationUpdater(payload, {atmosphere, store})
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      const {addOrg} = res
      const error = getGraphQLError(res, errors)
      if (!error) {
        const {authToken} = addOrg
        atmosphere.setAuthToken(authToken)
        popOrganizationCreatedToast(addOrg, {atmosphere})
        const teamId = addOrg.team && addOrg.team.id
        history.push(`/team/${teamId}`)
      }
    },
    onError
  })
}

export default AddOrgMutation

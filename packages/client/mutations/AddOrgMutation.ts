import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import handleAddOrganization from './handlers/handleAddOrganization'
import handleAddTeams from './handlers/handleAddTeams'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'
import {OnNextHandler} from '../types/relayMutations'
import {AddOrgMutation_organization} from '../__generated__/AddOrgMutation_organization.graphql'

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
      ...CompleteTeamFragWithMembers @relay(mask: false)
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
      ...AddOrgMutation_organization @relay(mask: false)
    }
  }
`

const popOrganizationCreatedToast: OnNextHandler<AddOrgMutation_organization> = (
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

export const addOrgMutationOrganizationUpdater = (payload, store, viewerId) => {
  const organization = payload.getLinkedRecord('organization')
  handleAddOrganization(organization, store, viewerId)

  const team = payload.getLinkedRecord('team')
  handleAddTeams(team, store)
}

export const addOrgMutationNotificationUpdater = (payload, {store}) => {
  const removedSuggestedActionId = payload.getValue('removedSuggestedActionId')
  handleRemoveSuggestedActions(removedSuggestedActionId, store)
}

const AddOrgMutation = (atmosphere, variables, {history}, onError, onCompleted) => {
  const {viewerId} = atmosphere
  return commitMutation(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addOrg')
      if (!payload) return
      addOrgMutationOrganizationUpdater(payload, store, viewerId)
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      if (!errors) {
        const payload = res.addOrg
        popOrganizationCreatedToast(payload, {atmosphere})
        const teamId = payload.team && payload.team.id
        history.push(`/team/${teamId}`)
      }
    },
    onError
  })
}

export default AddOrgMutation

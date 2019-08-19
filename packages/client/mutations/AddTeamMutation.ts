import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import handleAddTeams from './handlers/handleAddTeams'
import createProxyRecord from '../utils/relay/createProxyRecord'
import getGraphQLError from '../utils/relay/getGraphQLError'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'
import {OnNextHandler} from '../types/relayMutations'
import {AddTeamMutation_team} from '../__generated__/AddTeamMutation_team.graphql'

graphql`
  fragment AddTeamMutation_team on AddTeamPayload {
    team {
      ...CompleteTeamFragWithMembers @relay(mask: false)
    }
  }
`

graphql`
  fragment AddTeamMutation_notification on AddTeamPayload {
    removedSuggestedActionId
  }
`

const mutation = graphql`
  mutation AddTeamMutation($newTeam: NewTeamInput!) {
    addTeam(newTeam: $newTeam) {
      error {
        message
      }
      ...AddTeamMutation_team @relay(mask: false)
    }
  }
`

const popTeamCreatedToast: OnNextHandler<AddTeamMutation_team> = (
  payload,
  {atmosphere, history}
) => {
  const {team} = payload
  if (!team) return
  const {id: teamId, name: teamName} = team
  atmosphere.eventEmitter.emit('addSnackbar', {
    autoDismiss: 5,
    key: `teamCreated:${teamId}`,
    message: `Team created! Here's your new team dashboard for ${teamName}`
  })
  history && history.push(`/team/${teamId}`)
}

export const addTeamTeamUpdater = (payload, store) => {
  const team = payload.getLinkedRecord('team')
  handleAddTeams(team, store)
}

export const addTeamMutationNotificationUpdater = (payload, {store}) => {
  const removedSuggestedActionId = payload.getValue('removedSuggestedActionId')
  handleRemoveSuggestedActions(removedSuggestedActionId, store)
}

const AddTeamMutation = (atmosphere, variables, options, onError, onCompleted) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addTeam')
      if (!payload) return
      addTeamTeamUpdater(payload, store)
    },
    optimisticUpdater: (store) => {
      const {newTeam} = variables
      const team = createProxyRecord(store, 'Team', {
        ...newTeam,
        isPaid: true
      })
      handleAddTeams(team, store)
    },
    onCompleted: (res, errors) => {
      onCompleted(res, errors)
      const error = getGraphQLError(res, errors)
      if (!error) {
        const payload = res.addTeam
        popTeamCreatedToast(payload, {atmosphere, ...options})
      }
    },
    onError
  })
}

export default AddTeamMutation

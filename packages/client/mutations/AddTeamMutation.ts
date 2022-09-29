import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {
  HistoryLocalHandler,
  OnNextHandler,
  OnNextHistoryContext,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import getGraphQLError from '../utils/relay/getGraphQLError'
import {AddTeamMutation as TAddTeamMutation} from '../__generated__/AddTeamMutation.graphql'
import {AddTeamMutation_team} from '../__generated__/AddTeamMutation_team.graphql'
import handleAddTeams from './handlers/handleAddTeams'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'

graphql`
  fragment AddTeamMutation_team on AddTeamPayload {
    team {
      id
      name
      ...MeetingsDashActiveMeetings
      ...Team_team
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
      authToken
      ...AddTeamMutation_team @relay(mask: false)
    }
  }
`

const popTeamCreatedToast: OnNextHandler<AddTeamMutation_team, OnNextHistoryContext> = (
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

export const addTeamTeamUpdater: SharedUpdater<AddTeamMutation_team> = (payload, {store}) => {
  const team = payload.getLinkedRecord('team')
  handleAddTeams(team, store)
}

export const addTeamMutationNotificationUpdater = (payload, {store}) => {
  const removedSuggestedActionId = payload.getValue('removedSuggestedActionId')
  handleRemoveSuggestedActions(removedSuggestedActionId, store)
}

const AddTeamMutation: StandardMutation<TAddTeamMutation, HistoryLocalHandler> = (
  atmosphere,
  variables,
  {history, onError, onCompleted}
) => {
  return commitMutation<TAddTeamMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addTeam')
      addTeamTeamUpdater(payload, {atmosphere, store})
    },
    // optimistic updater is too brittle because if we are missing a single field it could break
    onCompleted: (res, errors) => {
      onCompleted(res, errors)
      const error = getGraphQLError(res, errors)
      const {addTeam} = res
      if (!error) {
        const {authToken} = addTeam
        atmosphere.setAuthToken(authToken)
        popTeamCreatedToast(addTeam, {atmosphere, history})
      }
    },
    onError
  })
}

export default AddTeamMutation

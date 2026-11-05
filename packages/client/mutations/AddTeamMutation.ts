import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {AddTeamMutation as TAddTeamMutation} from '../__generated__/AddTeamMutation.graphql'
import type {AddTeamMutation_notification$data} from '../__generated__/AddTeamMutation_notification.graphql'
import {isRejected} from '../hooks/useTeamInviteeDrafts'
import type {
  NavigateLocalHandler,
  OnNextNavigateContext,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import plural from '../utils/plural'
import getGraphQLError from '../utils/relay/getGraphQLError'
import handleAddTeams from './handlers/handleAddTeams'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'

graphql`
  fragment AddTeamMutation_notification on AddTeamPayload {
    removedSuggestedActionId
    team {
      id
      name
      ...PublicTeamsFrag_team
      ...NewTeamForm_teams
      ...MeetingsDashActiveMeetings
      ...Team_team
      ...ActivityDetailsSidebar_teams
    }
  }
`

const mutation = graphql`
  mutation AddTeamMutation($newTeam: NewTeamInput!, $invitees: [Email!]) {
    addTeam(newTeam: $newTeam, invitees: $invitees) {
      error {
        message
      }
      invitees {
        email
        status
        message
        suggestedEmail
      }
      ...AddTeamMutation_notification @relay(mask: false)
    }
  }
`

const popTeamCreatedToast = (
  addTeam: TAddTeamMutation['response']['addTeam'],
  {atmosphere, navigate}: OnNextNavigateContext
) => {
  const {team, invitees} = addTeam
  if (!team) return
  const {id: teamId, name: teamName} = team
  const sentCount = invitees?.filter(({status}) => status === 'sent').length ?? 0
  const createdMessage = sentCount
    ? `Team created and ${sentCount} ${plural(sentCount, 'invitation')} sent!`
    : 'Team created!'
  atmosphere.eventEmitter.emit('addSnackbar', {
    autoDismiss: 5,
    key: `teamCreated:${teamId}`,
    message: `${createdMessage} Here's your new team dashboard for ${teamName}`
  })
  // the team page opens its invite dialog to explain any invitation that did not go out
  const inviteResults = invitees?.some(isRejected) ? invitees : undefined
  navigate?.(`/team/${teamId}`, {state: inviteResults ? {inviteResults} : null})
}

export const addTeamMutationNotificationUpdater: SharedUpdater<
  AddTeamMutation_notification$data
> = (payload, {store}) => {
  const team = payload.getLinkedRecord('team')
  handleAddTeams(team, store)

  const removedSuggestedActionId = payload.getValue('removedSuggestedActionId')
  handleRemoveSuggestedActions(removedSuggestedActionId, store)
}

type ExtendedNavigateLocalHandler = NavigateLocalHandler & {
  showTeamCreatedToast?: boolean
}
const AddTeamMutation: StandardMutation<TAddTeamMutation, ExtendedNavigateLocalHandler> = (
  atmosphere,
  variables,
  {navigate, onError, onCompleted, showTeamCreatedToast = true}
) => {
  return commitMutation<TAddTeamMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addTeam')
      addTeamMutationNotificationUpdater(payload, {atmosphere, store})
    },
    // optimistic updater is too brittle because if we are missing a single field it could break
    onCompleted: (res, errors) => {
      onCompleted(res, errors)
      const error = getGraphQLError(res, errors)
      const {addTeam} = res
      if (!error) {
        if (showTeamCreatedToast) {
          popTeamCreatedToast(addTeam, {atmosphere, navigate})
        }
      }
    },
    onError
  })
}

export default AddTeamMutation

import graphql from 'babel-plugin-relay/macro'
import {commitMutation, type UseMutationConfig, useMutation} from 'react-relay'
import type {MutationConfig, SelectorStoreUpdater} from 'relay-runtime'
import type {useInviteToTeamMutation as TInviteToTeamMutation} from '../__generated__/useInviteToTeamMutation.graphql'
import type Atmosphere from '../Atmosphere'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'

const mutation = graphql`
  mutation useInviteToTeamMutation($meetingId: ID, $teamId: ID!, $invitees: [Email!]!) {
    inviteToTeam(meetingId: $meetingId, teamId: $teamId, invitees: $invitees) {
      invitees {
        email
        status
        message
        suggestedEmail
      }
      removedSuggestedActionId
    }
  }
`

const updater: SelectorStoreUpdater<TInviteToTeamMutation['response']> = (store) => {
  const payload = store.getRootField('inviteToTeam')
  if (!payload) return
  handleRemoveSuggestedActions(payload.getValue('removedSuggestedActionId'), store)
}

// For callers outside of React, like a snackbar action
export const commitInviteToTeamMutation = (
  atmosphere: Atmosphere,
  config: Omit<MutationConfig<TInviteToTeamMutation>, 'mutation'>
) => commitMutation<TInviteToTeamMutation>(atmosphere, {mutation, updater, ...config})

const useInviteToTeamMutation = () => {
  const [commit, submitting] = useMutation<TInviteToTeamMutation>(mutation)
  const execute = (config: UseMutationConfig<TInviteToTeamMutation>) => {
    return commit({updater, ...config})
  }
  return [execute, submitting] as const
}

export default useInviteToTeamMutation

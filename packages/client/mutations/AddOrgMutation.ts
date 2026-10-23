import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {AddOrgMutation as TAddOrgMutation} from '../__generated__/AddOrgMutation.graphql'
import type {AddOrgMutation_notification$data} from '../__generated__/AddOrgMutation_notification.graphql'
import {isRejected} from '../hooks/useTeamInviteeDrafts'
import type {
  NavigateLocalHandler,
  OnNextBaseContext,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import plural from '../utils/plural'
import getGraphQLError from '../utils/relay/getGraphQLError'
import handleAddOrganization from './handlers/handleAddOrganization'
import handleAddTeams from './handlers/handleAddTeams'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'

graphql`
  fragment AddOrgMutation_notification on AddOrgPayload {
    removedSuggestedActionId
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
      billingTier
    }
    team {
      id
      name
      ...PublicTeamsFrag_team
      ...MeetingsDashActiveMeetings
      ...Team_team
    }
  }
`

const mutation = graphql`
  mutation AddOrgMutation($newTeam: NewTeamInput!, $orgName: String!, $invitees: [Email!]) {
    addOrg(newTeam: $newTeam, orgName: $orgName, invitees: $invitees) {
      error {
        message
      }
      invitees {
        email
        status
        message
        suggestedEmail
      }
      ...AddOrgMutation_notification @relay(mask: false)
    }
  }
`

const popOrganizationCreatedToast = (
  addOrg: TAddOrgMutation['response']['addOrg'],
  {atmosphere}: OnNextBaseContext
) => {
  const {team, invitees} = addOrg
  if (!team) return
  const {name: teamName, id: teamId} = team
  const sentCount = invitees?.filter(({status}) => status === 'sent').length ?? 0
  const createdMessage = sentCount
    ? `Organization created and ${sentCount} ${plural(sentCount, 'invitation')} sent!`
    : 'Organization created!'
  atmosphere.eventEmitter.emit('addSnackbar', {
    autoDismiss: 5,
    key: `orgCreated:${teamId}`,
    message: `${createdMessage} Here's your new team dashboard for ${teamName}`
  })
}

export const addOrgMutationNotificationUpdater: SharedUpdater<AddOrgMutation_notification$data> = (
  payload,
  {store}
) => {
  const organization = payload.getLinkedRecord('organization')
  handleAddOrganization(organization, store)

  const team = payload.getLinkedRecord('team')
  handleAddTeams(team, store)

  const removedSuggestedActionId = payload.getValue('removedSuggestedActionId')
  handleRemoveSuggestedActions(removedSuggestedActionId, store)
}

const AddOrgMutation: StandardMutation<TAddOrgMutation, NavigateLocalHandler> = (
  atmosphere,
  variables,
  {navigate, onError, onCompleted}
) => {
  return commitMutation<TAddOrgMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addOrg')
      if (!payload) return
      addOrgMutationNotificationUpdater(payload, {atmosphere, store})
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      const {addOrg} = res
      const error = getGraphQLError(res, errors)
      if (!error) {
        popOrganizationCreatedToast(addOrg, {atmosphere})
        const teamId = addOrg.team && addOrg.team.id
        const inviteResults = addOrg.invitees?.some(isRejected) ? addOrg.invitees : undefined
        navigate(`/team/${teamId}`, {state: inviteResults ? {inviteResults} : null})
      }
    },
    onError
  })
}

export default AddOrgMutation

import {addTeamTeamUpdater} from '../mutations/AddTeamMutation'
import {archiveTeamTeamOnNext, archiveTeamTeamUpdater} from '../mutations/ArchiveTeamMutation'
import {
  removeTeamMemberTeamOnNext,
  removeTeamMemberTeamUpdater
} from '../mutations/RemoveTeamMemberMutation'
import {removeOrgUserTeamOnNext, removeOrgUserTeamUpdater} from '../mutations/RemoveOrgUserMutation'
import {startNewMeetingTeamOnNext} from '../mutations/StartNewMeetingMutation'
import {endNewMeetingTeamOnNext, endNewMeetingTeamUpdater} from '../mutations/EndNewMeetingMutation'
import {addReflectTemplateTeamUpdater} from '../mutations/AddReflectTemplateMutation'
import {removeReflectTemplateTeamUpdater} from '../mutations/RemoveReflectTemplateMutation'
import {addReflectTemplatePromptTeamUpdater} from '../mutations/AddReflectTemplatePromptMutation'
import {removeReflectTemplatePromptTeamUpdater} from '../mutations/RemoveReflectTemplatePromptMutation'
import {moveReflectTemplatePromptTeamUpdater} from '../mutations/MoveReflectTemplatePromptMutation'
import {
  acceptTeamInvitationTeamOnNext,
  acceptTeamInvitationTeamUpdater
} from '../mutations/AcceptTeamInvitationMutation'
import {addAgendaItemUpdater} from '../mutations/AddAgendaItemMutation'
import {removeAgendaItemUpdater} from '../mutations/RemoveAgendaItemMutation'
import {updateAgendaItemUpdater} from '../mutations/UpdateAgendaItemMutation'
import graphql from 'babel-plugin-relay/macro'
import {pushInvitationTeamOnNext} from '../mutations/PushInvitationMutation'
import {denyPushInvitationTeamOnNext} from '../mutations/DenyPushInvitationMutation'
import Atmosphere from '../Atmosphere'
import {requestSubscription, Variables} from 'relay-runtime'
import {TeamSubscriptionResponse} from '../__generated__/TeamSubscription.graphql'
import {RouterProps} from 'react-router'
import {navigateMeetingTeamUpdater} from 'mutations/NavigateMeetingMutation'

const subscription = graphql`
  subscription TeamSubscription {
    teamSubscription {
      __typename
      ...AcceptTeamInvitationMutation_team @relay(mask: false)
      ...AddReflectTemplateMutation_team @relay(mask: false)
      ...AddReflectTemplatePromptMutation_team @relay(mask: false)
      ...AddTeamMutation_team @relay(mask: false)
      ...ArchiveTeamMutation_team @relay(mask: false)
      ...DenyPushInvitationMutation_team @relay(mask: false)
      ...EndNewMeetingMutation_team @relay(mask: false)
      ...MoveReflectTemplatePromptMutation_team @relay(mask: false)
      ...NavigateMeetingMutation_team @relay(mask: false)
      ...PromoteToTeamLeadMutation_team @relay(mask: false)
      ...PushInvitationMutation_team @relay(mask: false)
      ...RemoveReflectTemplateMutation_team @relay(mask: false)
      ...RemoveReflectTemplatePromptMutation_team @relay(mask: false)
      ...RemoveTeamMemberMutation_team @relay(mask: false)
      ...RemoveOrgUserMutation_team @relay(mask: false)
      ...RenameMeetingMutation_team @relay(mask: false)
      ...RenameReflectTemplateMutation_team @relay(mask: false)
      ...RenameReflectTemplatePromptMutation_team @relay(mask: false)
      ...SelectRetroTemplateMutation_team @relay(mask: false)
      ...SetCheckInEnabledMutation_team @relay(mask: false)
      ...StartNewMeetingMutation_team @relay(mask: false)
      ...UpdateCreditCardMutation_team @relay(mask: false)
      ...UpdateUserProfileMutation_team @relay(mask: false)
      ...UpdateTeamNameMutation_team @relay(mask: false)
      ...UpgradeToProMutation_team @relay(mask: false)
      ...AddAgendaItemMutation_team @relay(mask: false)
      ...RemoveAgendaItemMutation_team @relay(mask: false)
      ...UpdateAgendaItemMutation_team @relay(mask: false)
    }
  }
`

const onNextHandlers = {
  AcceptTeamInvitationPayload: acceptTeamInvitationTeamOnNext,
  ArchiveTeamPayload: archiveTeamTeamOnNext,
  DenyPushInvitationPayload: denyPushInvitationTeamOnNext,
  EndNewMeetingPayload: endNewMeetingTeamOnNext,
  StartNewMeetingPayload: startNewMeetingTeamOnNext,
  RemoveOrgUserPayload: removeOrgUserTeamOnNext,
  RemoveTeamMemberPayload: removeTeamMemberTeamOnNext,
  PushInvitationPayload: pushInvitationTeamOnNext
}

const updateHandlers = {
  AddAgendaItemPayload: addAgendaItemUpdater,
  RemoveAgendaItemPayload: removeAgendaItemUpdater,
  UpdateAgendaItemPayload: updateAgendaItemUpdater,
  AcceptTeamInvitationPayload: acceptTeamInvitationTeamUpdater,
  AddReflectTemplatePayload: addReflectTemplateTeamUpdater,
  AddReflectTemplatePromptPayload: addReflectTemplatePromptTeamUpdater,
  AddTeamMutationPayload: addTeamTeamUpdater,
  ArchiveTeamPayload: archiveTeamTeamUpdater,
  EndNewMeetingPayload: endNewMeetingTeamUpdater,
  MoveReflectTemplatePromptPayload: moveReflectTemplatePromptTeamUpdater,
  NavigateMeetingPayload: navigateMeetingTeamUpdater,
  RemoveOrgUserPayload: removeOrgUserTeamUpdater,
  RemoveReflectTemplatePayload: removeReflectTemplateTeamUpdater,
  RemoveReflectTemplatePromptPayload: removeReflectTemplatePromptTeamUpdater,
  RemoveTeamMemberPayload: removeTeamMemberTeamUpdater
}

const TeamSubscription = (
  atmosphere: Atmosphere,
  variables: Variables,
  router: {history: RouterProps['history']}
) => {
  return requestSubscription<TeamSubscriptionResponse>(atmosphere, {
    subscription,
    variables,
    updater: (store) => {
      const payload = store.getRootField('teamSubscription') as any
      if (!payload) return
      const type = payload.getValue('__typename') as string
      const handler = updateHandlers[type]
      if (handler) {
        handler(payload, {atmosphere, store})
      }
    },
    onNext: (result) => {
      if (!result) return
      const {teamSubscription} = result
      const {__typename: type} = teamSubscription
      const handler = onNextHandlers[type]
      if (handler) {
        handler(teamSubscription, {...router, atmosphere})
      }
    },
    onCompleted: () => {
      atmosphere.unregisterSub(TeamSubscription.name, variables)
    }
  })
}

export default TeamSubscription

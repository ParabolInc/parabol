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
import {RecordSourceSelectorProxy, requestSubscription, Variables} from 'relay-runtime'
import {TeamSubscriptionResponse} from '../__generated__/TeamSubscription.graphql'
import {RouterProps} from 'react-router'

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
      ...PromoteToTeamLeadMutation_team @relay(mask: false)
      ...PushInvitationMutation_team @relay(mask: false)
      ...RemoveReflectTemplateMutation_team @relay(mask: false)
      ...RemoveReflectTemplatePromptMutation_team @relay(mask: false)
      ...RemoveTeamMemberMutation_team @relay(mask: false)
      ...RemoveOrgUserMutation_team @relay(mask: false)
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

const TeamSubscription = (
  atmosphere: Atmosphere,
  variables: Variables,
  router: {history: RouterProps['history']}
) => {
  const {viewerId} = atmosphere
  return requestSubscription<TeamSubscriptionResponse>(atmosphere, {
    subscription,
    variables,
    updater: (store) => {
      const payload = store.getRootField('teamSubscription') as any
      if (!payload) return
      const type = payload.getValue('__typename')
      const context = {atmosphere, store: store as RecordSourceSelectorProxy<any>}
      switch (type) {
        case 'AddAgendaItemPayload':
          addAgendaItemUpdater(payload, context)
          break
        case 'RemoveAgendaItemPayload':
          removeAgendaItemUpdater(payload, context)
          break
        case 'UpdateAgendaItemPayload':
          updateAgendaItemUpdater(payload, context)
          break
        case 'AcceptTeamInvitationPayload':
          acceptTeamInvitationTeamUpdater(payload, context)
          break
        case 'AddReflectTemplatePayload':
          addReflectTemplateTeamUpdater(payload, context)
          break
        case 'AddReflectTemplatePromptPayload':
          addReflectTemplatePromptTeamUpdater(payload, context)
          break
        case 'CreateGitHubIssuePayload':
          break
        case 'AddTeamMutationPayload':
          addTeamTeamUpdater(payload, context)
          break
        case 'ArchiveTeamPayload':
          archiveTeamTeamUpdater(payload, store, viewerId)
          break
        case 'EndNewMeetingPayload':
          endNewMeetingTeamUpdater(payload, context)
          break
        case 'MeetingCheckInPayload':
          break
        case 'MoveReflectTemplatePromptPayload':
          moveReflectTemplatePromptTeamUpdater(payload, context)
          break
        case 'PromoteToTeamLeadPayload':
          break
        case 'RemoveOrgUserPayload':
          removeOrgUserTeamUpdater(payload, store, viewerId)
          break
        case 'RemoveReflectTemplatePayload':
          removeReflectTemplateTeamUpdater(payload, context)
          break
        case 'RemoveReflectTemplatePromptPayload':
          removeReflectTemplatePromptTeamUpdater(payload, context)
          break
        case 'RemoveTeamMemberPayload':
          removeTeamMemberTeamUpdater(payload, store, viewerId)
          break
        case 'RenameReflectTemplatePayload':
          break
        case 'RenameReflectTemplatePromptPayload':
          break
        case 'ReflectTemplatePromptUpdateDescriptionPayload':
          break
        case 'SelectRetroTemplatePayload':
          break
        case 'StartNewMeetingPayload':
          break
        case 'UpdateCreditCardPayload':
          break
        case 'UpdateNewCheckInQuestionPayload':
          break
        case 'UpgradeToProPayload':
          break
        default:
          console.error('TeamSubscription case fail', type)
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

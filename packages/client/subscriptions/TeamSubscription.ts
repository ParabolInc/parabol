import graphql from 'babel-plugin-relay/macro'
import {RouterProps} from 'react-router'
import {requestSubscription} from 'relay-runtime'
import {endCheckInTeamOnNext, endCheckInTeamUpdater} from '~/mutations/EndCheckInMutation'
import {
  endRetrospectiveTeamOnNext,
  endRetrospectiveTeamUpdater
} from '~/mutations/EndRetrospectiveMutation'
import {navigateMeetingTeamUpdater} from '~/mutations/NavigateMeetingMutation'
import Atmosphere from '../Atmosphere'
import {
  TeamSubscription as TTeamSubscription,
  TeamSubscription$variables
} from '../__generated__/TeamSubscription.graphql'
import {
  acceptTeamInvitationTeamOnNext,
  acceptTeamInvitationTeamUpdater
} from '../mutations/AcceptTeamInvitationMutation'
import {addAgendaItemUpdater} from '../mutations/AddAgendaItemMutation'
import {addPokerTemplateTeamUpdater} from '../mutations/AddPokerTemplateMutation'
import {addReflectTemplateTeamUpdater} from '../mutations/AddReflectTemplateMutation'
import {addReflectTemplatePromptTeamUpdater} from '../mutations/AddReflectTemplatePromptMutation'
import {addTeamTeamUpdater} from '../mutations/AddTeamMutation'
import {archiveTeamTeamOnNext, archiveTeamTeamUpdater} from '../mutations/ArchiveTeamMutation'
import {batchArchiveTasksTaskUpdater} from '../mutations/BatchArchiveTasksMutation'
import {denyPushInvitationTeamOnNext} from '../mutations/DenyPushInvitationMutation'
import {
  endSprintPokerTeamOnNext,
  endSprintPokerTeamUpdater
} from '../mutations/EndSprintPokerMutation'
import {endTeamPromptTeamUpdater} from '../mutations/EndTeamPromptMutation'
import {joinTeamTeamOnNext} from '../mutations/JoinTeamMutation'
import {moveReflectTemplatePromptTeamUpdater} from '../mutations/MoveReflectTemplatePromptMutation'
import {pushInvitationTeamOnNext} from '../mutations/PushInvitationMutation'
import {removeAgendaItemUpdater} from '../mutations/RemoveAgendaItemMutation'
import {
  removeOrgUsersTeamOnNext,
  removeOrgUsersTeamUpdater
} from '../mutations/RemoveOrgUsersMutation'
import {removeReflectTemplateTeamUpdater} from '../mutations/RemoveReflectTemplateMutation'
import {removeReflectTemplatePromptTeamUpdater} from '../mutations/RemoveReflectTemplatePromptMutation'
import {
  removeTeamMemberTeamOnNext,
  removeTeamMemberTeamUpdater
} from '../mutations/RemoveTeamMemberMutation'
import {updateAgendaItemUpdater} from '../mutations/UpdateAgendaItemMutation'
import subscriptionOnNext from './subscriptionOnNext'
import subscriptionUpdater from './subscriptionUpdater'

const subscription = graphql`
  subscription TeamSubscription {
    teamSubscription {
      fieldName
      GenerateInsightSuccess {
        ...GenerateInsightMutation_team @relay(mask: false)
      }
      UpdateRecurrenceSettingsSuccess {
        ...UpdateRecurrenceSettingsMutation_team @relay(mask: false)
      }
      UpdateDimensionFieldSuccess {
        ...UpdateJiraDimensionFieldMutation_team @relay(mask: false)
      }
      UpdateGitHubDimensionFieldSuccess {
        ...UpdateGitHubDimensionFieldMutation_team @relay(mask: false)
      }
      MovePokerTemplateScaleValueSuccess {
        ...MovePokerTemplateScaleValueMutation_team @relay(mask: false)
      }
      AcceptTeamInvitationPayload {
        ...AcceptTeamInvitationMutation_team @relay(mask: false)
      }
      AddAgendaItemPayload {
        ...AddAgendaItemMutation_team @relay(mask: false)
      }
      AddAtlassianAuthPayload {
        ...AddAtlassianAuthMutation_team @relay(mask: false)
      }
      AddReflectTemplateSuccess {
        ...AddReflectTemplateMutation_team @relay(mask: false)
      }
      AddPokerTemplateSuccess {
        ...AddPokerTemplateMutation_team @relay(mask: false)
      }
      AddReflectTemplatePromptPayload {
        ...AddReflectTemplatePromptMutation_team @relay(mask: false)
      }
      AddTeamPayload {
        ...AddTeamMutation_team @relay(mask: false)
      }
      BatchArchiveTasksSuccess {
        ...BatchArchiveTasksMutation_tasks @relay(mask: false)
      }
      ArchiveTeamPayload {
        ...ArchiveTeamMutation_team @relay(mask: false)
      }
      DenyPushInvitationPayload {
        ...DenyPushInvitationMutation_team @relay(mask: false)
      }
      EndCheckInSuccess {
        ...EndCheckInMutation_team @relay(mask: false)
      }
      EndRetrospectiveSuccess {
        ...EndRetrospectiveMutation_team @relay(mask: false)
      }
      EndSprintPokerSuccess {
        ...EndSprintPokerMutation_team @relay(mask: false)
      }
      EndTeamPromptSuccess {
        ...EndTeamPromptMutation_team @relay(mask: false)
      }
      JoinTeamSuccess {
        ...JoinTeamMutation_team @relay(mask: false)
      }
      MoveReflectTemplatePromptPayload {
        ...MoveReflectTemplatePromptMutation_team @relay(mask: false)
      }
      NavigateMeetingPayload {
        ...NavigateMeetingMutation_team @relay(mask: false)
      }
      PromoteToTeamLeadPayload {
        ...PromoteToTeamLeadMutation_team @relay(mask: false)
      }
      PushInvitationPayload {
        ...PushInvitationMutation_team @relay(mask: false)
      }
      ReflectTemplatePromptUpdateGroupColorPayload {
        ...ReflectTemplatePromptUpdateGroupColorMutation_team @relay(mask: false)
      }
      RemoveAgendaItemPayload {
        ...RemoveAgendaItemMutation_team @relay(mask: false)
      }
      RemoveOrgUsersSuccess {
        ...RemoveOrgUsersMutation_team @relay(mask: false)
      }
      RemoveReflectTemplatePayload {
        ...RemoveReflectTemplateMutation_team @relay(mask: false)
      }
      RemoveReflectTemplatePromptPayload {
        ...RemoveReflectTemplatePromptMutation_team @relay(mask: false)
      }
      RemoveTeamMemberPayload {
        ...RemoveTeamMemberMutation_team @relay(mask: false)
      }
      RenameMeetingSuccess {
        ...RenameMeetingMutation_team @relay(mask: false)
      }
      RenameMeetingTemplatePayload {
        ...RenameMeetingTemplateMutation_meetingTemplate @relay(mask: false)
      }
      RenameReflectTemplatePromptPayload {
        ...RenameReflectTemplatePromptMutation_team @relay(mask: false)
      }
      SelectTemplatePayload {
        ...SelectTemplateMutation_team @relay(mask: false)
      }
      SetAppLocationSuccess {
        ...SetAppLocationMutation_team @relay(mask: false)
      }
      SetMeetingSettingsPayload {
        ...SetMeetingSettingsMutation_team @relay(mask: false)
      }
      SetTeamNotificationSettingSuccess {
        ...SetTeamNotificationSettingMutation_settings @relay(mask: false)
      }
      StartCheckInSuccess {
        ...StartCheckInMutation_team @relay(mask: false)
      }
      StartRetrospectiveSuccess {
        ...StartRetrospectiveMutation_team @relay(mask: false)
      }
      StartSprintPokerSuccess {
        ...StartSprintPokerMutation_team @relay(mask: false)
      }
      StartTeamPromptSuccess {
        ...StartTeamPromptMutation_team @relay(mask: false)
      }
      UpdateAgendaItemPayload {
        ...UpdateAgendaItemMutation_team @relay(mask: false)
      }
      UpdateCreditCardPayload {
        ...UpdateCreditCardMutation_team @relay(mask: false)
      }
      UpdateTeamNamePayload {
        ...UpdateTeamNameMutation_team @relay(mask: false)
      }
      UpdateTemplateCategorySuccess {
        ...UpdateTemplateCategoryMutation_team @relay(mask: false)
      }
      UpdateUserProfilePayload {
        ...UpdateUserProfileMutation_team @relay(mask: false)
      }
    }
  }
`

const onNextHandlers = {
  AcceptTeamInvitationPayload: acceptTeamInvitationTeamOnNext,
  ArchiveTeamPayload: archiveTeamTeamOnNext,
  DenyPushInvitationPayload: denyPushInvitationTeamOnNext,
  EndCheckInSuccess: endCheckInTeamOnNext,
  EndRetrospectiveSuccess: endRetrospectiveTeamOnNext,
  EndSprintPokerSuccess: endSprintPokerTeamOnNext,
  JoinTeamSuccess: joinTeamTeamOnNext,
  RemoveOrgUsersSuccess: removeOrgUsersTeamOnNext,
  RemoveTeamMemberPayload: removeTeamMemberTeamOnNext,
  PushInvitationPayload: pushInvitationTeamOnNext
} as const

const updateHandlers = {
  AddAgendaItemPayload: addAgendaItemUpdater,
  RemoveAgendaItemPayload: removeAgendaItemUpdater,
  UpdateAgendaItemPayload: updateAgendaItemUpdater,
  AcceptTeamInvitationPayload: acceptTeamInvitationTeamUpdater,
  AddReflectTemplateSuccess: addReflectTemplateTeamUpdater,
  AddPokerTemplateSuccess: addPokerTemplateTeamUpdater,
  AddReflectTemplatePromptPayload: addReflectTemplatePromptTeamUpdater,
  AddTeamMutationPayload: addTeamTeamUpdater,
  ArchiveTeamPayload: archiveTeamTeamUpdater,
  BatchArchiveTasksSuccess: batchArchiveTasksTaskUpdater,
  EndCheckInSuccess: endCheckInTeamUpdater,
  EndRetrospectiveSuccess: endRetrospectiveTeamUpdater,
  EndSprintPokerSuccess: endSprintPokerTeamUpdater,
  EndTeamPromptSuccess: endTeamPromptTeamUpdater,
  MoveReflectTemplatePromptPayload: moveReflectTemplatePromptTeamUpdater,
  NavigateMeetingPayload: navigateMeetingTeamUpdater,
  RemoveOrgUsersSuccess: removeOrgUsersTeamUpdater,
  RemoveReflectTemplatePayload: removeReflectTemplateTeamUpdater,
  RemoveReflectTemplatePromptPayload: removeReflectTemplatePromptTeamUpdater,
  RemoveTeamMemberPayload: removeTeamMemberTeamUpdater
} as const

const TeamSubscription = (
  atmosphere: Atmosphere,
  variables: TeamSubscription$variables,
  router: {history: RouterProps['history']}
) => {
  atmosphere.registerSubscription(subscription)
  return requestSubscription<TTeamSubscription>(atmosphere, {
    subscription,
    variables,
    updater: subscriptionUpdater('teamSubscription', updateHandlers, atmosphere),
    onNext: subscriptionOnNext('teamSubscription', onNextHandlers, atmosphere, router),
    onCompleted: () => {
      atmosphere.unregisterSub(TeamSubscription.name, variables)
    }
  })
}
TeamSubscription.key = 'team'
export default TeamSubscription

import graphql from 'babel-plugin-relay/macro'
import {endCheckInTeamOnNext, endCheckInTeamUpdater} from '~/mutations/EndCheckInMutation'
import {
  endRetrospectiveTeamOnNext,
  endRetrospectiveTeamUpdater
} from '~/mutations/EndRetrospectiveMutation'
import {navigateMeetingTeamUpdater} from '~/mutations/NavigateMeetingMutation'
import {
  acceptTeamInvitationTeamOnNext,
  acceptTeamInvitationTeamUpdater
} from '../mutations/AcceptTeamInvitationMutation'
import {addAgendaItemUpdater} from '../mutations/AddAgendaItemMutation'
import {addTemplatePromptTeamUpdater} from '../mutations/AddTemplatePromptMutation'
import {archiveTeamTeamOnNext, archiveTeamTeamUpdater} from '../mutations/ArchiveTeamMutation'
import {batchArchiveTasksTaskUpdater} from '../mutations/BatchArchiveTasksMutation'
import {denyPushInvitationTeamOnNext} from '../mutations/DenyPushInvitationMutation'
import {
  endSprintPokerTeamOnNext,
  endSprintPokerTeamUpdater
} from '../mutations/EndSprintPokerMutation'
import {endTeamPromptTeamUpdater} from '../mutations/EndTeamPromptMutation'
import {joinTeamTeamOnNext} from '../mutations/JoinTeamMutation'
import {moveTemplatePromptTeamUpdater} from '../mutations/MoveTemplatePromptMutation'
import {pushInvitationTeamOnNext} from '../mutations/PushInvitationMutation'
import {removeAgendaItemUpdater} from '../mutations/RemoveAgendaItemMutation'
import {
  removeOrgUsersTeamOnNext,
  removeOrgUsersTeamUpdater
} from '../mutations/RemoveOrgUsersMutation'
import {removeReflectTemplateTeamUpdater} from '../mutations/RemoveReflectTemplateMutation'
import {removeTeamMemberTeamUpdater} from '../mutations/RemoveTeamMemberMutation'
import {removeTemplatePromptTeamUpdater} from '../mutations/RemoveTemplatePromptMutation'
import {updateAgendaItemUpdater} from '../mutations/UpdateAgendaItemMutation'
import {addPokerTemplateTeamUpdater} from '../mutations/useAddPokerTemplateMutation'
import {addReflectTemplateTeamUpdater} from '../mutations/useAddReflectTemplateMutation'
import {endTeamHealthTeamUpdater} from '../mutations/useEndTeamHealthMutation'
import {createSubscription} from './createSubscription'

const subscription = graphql`
  subscription TeamSubscription {
    teamSubscription {
      fieldName
      UpdateRecurrenceSettingsSuccess {
        ...UpdateRecurrenceSettingsMutation_team @relay(mask: false)
      }
      UpdateIntegrationDimensionFieldSuccess {
        ...useUpdateIntegrationDimensionFieldMutation_team @relay(mask: false)
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
      AddReflectTemplateSuccess {
        ...useAddReflectTemplateMutation_team @relay(mask: false)
      }
      AddPokerTemplateSuccess {
        ...useAddPokerTemplateMutation_team @relay(mask: false)
      }
      AddTemplatePromptSuccess {
        ...AddTemplatePromptMutation_team @relay(mask: false)
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
      EndTeamHealthSuccess {
        ...useEndTeamHealthMutation_team @relay(mask: false)
      }
      JoinTeamSuccess {
        ...JoinTeamMutation_team @relay(mask: false)
      }
      MoveTemplatePromptSuccess {
        ...MoveTemplatePromptMutation_team @relay(mask: false)
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
      UpdateTemplatePromptGroupColorSuccess {
        ...UpdateTemplatePromptGroupColorMutation_team @relay(mask: false)
      }
      RemoveAgendaItemPayload {
        ...RemoveAgendaItemMutation_team @relay(mask: false)
      }
      RemoveOrgUsersSuccess {
        ...RemoveOrgUsersMutation_team @relay(mask: false)
      }
      RemovePokerTemplateScalePayload {
        ...RemovePokerTemplateScaleMutation_team @relay(mask: false)
      }
      RemoveReflectTemplatePayload {
        ...RemoveReflectTemplateMutation_team @relay(mask: false)
      }
      RemoveTemplatePromptSuccess {
        ...RemoveTemplatePromptMutation_team @relay(mask: false)
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
      RenameTemplatePromptSuccess {
        ...RenameTemplatePromptMutation_team @relay(mask: false)
      }
      SelectTemplatePayload {
        ...SelectTemplateMutation_team @relay(mask: false)
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
      StartTeamHealthSuccess {
        ...useStartTeamHealthMutation_success @relay(mask: false)
      }
      AddTeamHealthTemplateQuestionSuccess {
        ...useAddTeamHealthTemplateQuestionMutation_team @relay(mask: false)
      }
      RemoveTeamHealthTemplateQuestionSuccess {
        ...useRemoveTeamHealthTemplateQuestionMutation_team @relay(mask: false)
      }
      UpdateAgendaItemPayload {
        ...UpdateAgendaItemMutation_team @relay(mask: false)
      }
      UpdateCreditCardPayload {
        ...UpdateCreditCardMutation_organization @relay(mask: false)
      }
      UpdateFacilitatorRotationSuccess {
        ...useUpdateFacilitatorRotationMutation_team @relay(mask: false)
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
      SetJiraDisplayFieldIdsPayload {
        team {
          jiraDisplayFieldIds
        }
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
  PushInvitationPayload: pushInvitationTeamOnNext
} as const

const updateHandlers = {
  AddAgendaItemPayload: addAgendaItemUpdater,
  RemoveAgendaItemPayload: removeAgendaItemUpdater,
  UpdateAgendaItemPayload: updateAgendaItemUpdater,
  AcceptTeamInvitationPayload: acceptTeamInvitationTeamUpdater,
  AddReflectTemplateSuccess: addReflectTemplateTeamUpdater,
  AddPokerTemplateSuccess: addPokerTemplateTeamUpdater,
  AddTemplatePromptSuccess: addTemplatePromptTeamUpdater,
  ArchiveTeamPayload: archiveTeamTeamUpdater,
  BatchArchiveTasksSuccess: batchArchiveTasksTaskUpdater,
  EndCheckInSuccess: endCheckInTeamUpdater,
  EndRetrospectiveSuccess: endRetrospectiveTeamUpdater,
  EndSprintPokerSuccess: endSprintPokerTeamUpdater,
  EndTeamPromptSuccess: endTeamPromptTeamUpdater,
  EndTeamHealthSuccess: endTeamHealthTeamUpdater,
  MoveTemplatePromptSuccess: moveTemplatePromptTeamUpdater,
  NavigateMeetingPayload: navigateMeetingTeamUpdater,
  RemoveOrgUsersSuccess: removeOrgUsersTeamUpdater,
  RemoveReflectTemplatePayload: removeReflectTemplateTeamUpdater,
  RemoveTemplatePromptSuccess: removeTemplatePromptTeamUpdater,
  RemoveTeamMemberPayload: removeTeamMemberTeamUpdater
} as const

export default createSubscription(subscription, onNextHandlers, updateHandlers)

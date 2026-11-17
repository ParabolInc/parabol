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
import {addPokerTemplateDimensionTeamUpdater} from '../mutations/AddPokerTemplateDimensionMutation'
import {addPokerTemplateScaleTeamUpdater} from '../mutations/AddPokerTemplateScaleMutation'
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
import {movePokerTemplateDimensionTeamUpdater} from '../mutations/MovePokerTemplateDimensionMutation'
import {moveTemplatePromptTeamUpdater} from '../mutations/MoveTemplatePromptMutation'
import {pushInvitationTeamOnNext} from '../mutations/PushInvitationMutation'
import {removeAgendaItemUpdater} from '../mutations/RemoveAgendaItemMutation'
import {
  removeOrgUsersTeamOnNext,
  removeOrgUsersTeamUpdater
} from '../mutations/RemoveOrgUsersMutation'
import {removePokerTemplateDimensionTeamUpdater} from '../mutations/RemovePokerTemplateDimensionMutation'
import {removePokerTemplateTeamUpdater} from '../mutations/RemovePokerTemplateMutation'
import {removePromptTemplateTeamUpdater} from '../mutations/RemovePromptTemplateMutation'
import {removeTeamMemberTeamUpdater} from '../mutations/RemoveTeamMemberMutation'
import {removeTemplatePromptTeamUpdater} from '../mutations/RemoveTemplatePromptMutation'
import {updateAgendaItemUpdater} from '../mutations/UpdateAgendaItemMutation'
import {addPokerTemplateTeamUpdater} from '../mutations/useAddPokerTemplateMutation'
import {addPromptTemplateTeamUpdater} from '../mutations/useAddPromptTemplateMutation'
import {addTeamHealthTemplateTeamUpdater} from '../mutations/useAddTeamHealthTemplateMutation'
import {endTeamHealthTeamUpdater} from '../mutations/useEndTeamHealthMutation'
import {createSubscription} from './createSubscription'

const subscription = graphql`
  subscription TeamSubscription {
    teamSubscription {
      fieldName
      UpdateRecurrenceSettingsPayload {
        ...UpdateRecurrenceSettingsMutation_team @relay(mask: false)
      }
      UpdateIntegrationDimensionFieldPayload {
        ...useUpdateIntegrationDimensionFieldMutation_team @relay(mask: false)
      }
      MovePokerTemplateScaleValuePayload {
        ...MovePokerTemplateScaleValueMutation_team @relay(mask: false)
      }
      AcceptTeamInvitationPayload {
        ...AcceptTeamInvitationMutation_team @relay(mask: false)
      }
      AddAgendaItemPayload {
        ...AddAgendaItemMutation_team @relay(mask: false)
      }
      AddPokerTemplateDimensionPayload {
        ...AddPokerTemplateDimensionMutation_dimension @relay(mask: false)
      }
      AddPokerTemplateScalePayload {
        ...AddPokerTemplateScaleMutation_scale @relay(mask: false)
      }
      AddPokerTemplateScaleValuePayload {
        ...AddPokerTemplateScaleValueMutation_scale @relay(mask: false)
      }
      AddTeamHealthTemplatePayload {
        ...useAddTeamHealthTemplateMutation_team @relay(mask: false)
      }
      AddPromptTemplatePayload {
        ...useAddPromptTemplateMutation_team @relay(mask: false)
      }
      AddPokerTemplatePayload {
        ...useAddPokerTemplateMutation_team @relay(mask: false)
      }
      AddTemplatePromptPayload {
        ...AddTemplatePromptMutation_team @relay(mask: false)
      }
      BatchArchiveTasksPayload {
        ...BatchArchiveTasksMutation_tasks @relay(mask: false)
      }
      ArchiveTeamPayload {
        ...ArchiveTeamMutation_team @relay(mask: false)
      }
      DenyPushInvitationPayload {
        ...DenyPushInvitationMutation_team @relay(mask: false)
      }
      DowngradeToStarterPayload {
        ...DowngradeToStarterMutation_organization @relay(mask: false)
      }
      EndCheckInPayload {
        ...EndCheckInMutation_team @relay(mask: false)
      }
      EndRetrospectivePayload {
        ...EndRetrospectiveMutation_team @relay(mask: false)
      }
      EndSprintPokerPayload {
        ...EndSprintPokerMutation_team @relay(mask: false)
      }
      EndTeamPromptPayload {
        ...EndTeamPromptMutation_team @relay(mask: false)
      }
      EndTeamHealthPayload {
        ...useEndTeamHealthMutation_team @relay(mask: false)
      }
      JoinTeamPayload {
        ...JoinTeamMutation_team @relay(mask: false)
      }
      MovePokerTemplateDimensionPayload {
        ...MovePokerTemplateDimensionMutation_team @relay(mask: false)
      }
      MoveTemplatePromptPayload {
        ...MoveTemplatePromptMutation_team @relay(mask: false)
      }
      NavigateMeetingPayload {
        ...NavigateMeetingMutation_team @relay(mask: false)
      }
      PokerTemplateDimensionUpdateDescriptionPayload {
        dimension {
          id
          description
        }
      }
      PromoteToTeamLeadPayload {
        ...PromoteToTeamLeadMutation_team @relay(mask: false)
      }
      PushInvitationPayload {
        ...PushInvitationMutation_team @relay(mask: false)
      }
      UpdateTemplatePromptGroupColorPayload {
        ...UpdateTemplatePromptGroupColorMutation_team @relay(mask: false)
      }
      RemoveAgendaItemPayload {
        ...RemoveAgendaItemMutation_team @relay(mask: false)
      }
      RemoveOrgUsersPayload {
        ...RemoveOrgUsersMutation_team @relay(mask: false)
      }
      RemovePokerTemplatePayload {
        ...RemovePokerTemplateMutation_team @relay(mask: false)
      }
      RemovePokerTemplateDimensionPayload {
        ...RemovePokerTemplateDimensionMutation_team @relay(mask: false)
      }
      RemovePokerTemplateScalePayload {
        ...RemovePokerTemplateScaleMutation_team @relay(mask: false)
      }
      RemovePromptTemplatePayload {
        ...RemovePromptTemplateMutation_team @relay(mask: false)
      }
      RemoveTemplatePromptPayload {
        ...RemoveTemplatePromptMutation_team @relay(mask: false)
      }
      RemoveTeamMemberPayload {
        ...RemoveTeamMemberMutation_team @relay(mask: false)
      }
      RenameMeetingPayload {
        ...RenameMeetingMutation_team @relay(mask: false)
      }
      RenameMeetingTemplatePayload {
        ...RenameMeetingTemplateMutation_meetingTemplate @relay(mask: false)
      }
      RenamePokerTemplateDimensionPayload {
        ...RenamePokerTemplateDimensionMutation_dimension @relay(mask: false)
      }
      RenamePokerTemplateScalePayload {
        ...RenamePokerTemplateScaleMutation_scale @relay(mask: false)
      }
      RenameTemplatePromptPayload {
        ...RenameTemplatePromptMutation_team @relay(mask: false)
      }
      SelectTemplatePayload {
        ...SelectTemplateMutation_team @relay(mask: false)
      }
      SetMeetingSettingsPayload {
        ...SetMeetingSettingsMutation_team @relay(mask: false)
      }
      SetTeamNotificationSettingPayload {
        ...SetTeamNotificationSettingMutation_settings @relay(mask: false)
      }
      StartCheckInPayload {
        ...StartCheckInMutation_team @relay(mask: false)
      }
      StartRetrospectivePayload {
        ...StartRetrospectiveMutation_team @relay(mask: false)
      }
      StartSprintPokerPayload {
        ...StartSprintPokerMutation_team @relay(mask: false)
      }
      StartTeamPromptPayload {
        ...StartTeamPromptMutation_team @relay(mask: false)
      }
      StartTeamHealthPayload {
        ...useStartTeamHealthMutation_success @relay(mask: false)
      }
      AddTeamHealthTemplateQuestionPayload {
        ...useAddTeamHealthTemplateQuestionMutation_team @relay(mask: false)
      }
      RemoveTeamHealthTemplateQuestionPayload {
        ...useRemoveTeamHealthTemplateQuestionMutation_team @relay(mask: false)
      }
      UpdateAgendaItemPayload {
        ...UpdateAgendaItemMutation_team @relay(mask: false)
      }
      UpdateCreditCardPayload {
        ...UpdateCreditCardMutation_organization @relay(mask: false) @alias
      }
      UpdateFacilitatorRotationPayload {
        ...useUpdateFacilitatorRotationMutation_team @relay(mask: false)
      }
      UpdateMeetingSeriesPayload {
        ...UpdateMeetingSeriesMutation_series @relay(mask: false)
      }
      UpdatePokerTemplateDimensionScalePayload {
        ...UpdatePokerTemplateDimensionScaleMutation_dimension @relay(mask: false)
      }
      UpdatePokerTemplateScaleValuePayload {
        ...UpdatePokerTemplateScaleValueMutation_scale @relay(mask: false)
      }
      UpdateTeamNamePayload {
        ...UpdateTeamNameMutation_team @relay(mask: false)
      }
      UpdateTemplateCategoryPayload {
        ...UpdateTemplateCategoryMutation_team @relay(mask: false)
      }
      UpdateTemplatePromptDescriptionPayload {
        ...UpdateTemplatePromptDescriptionMutation_team @relay(mask: false)
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
  EndCheckInPayload: endCheckInTeamOnNext,
  EndRetrospectivePayload: endRetrospectiveTeamOnNext,
  EndSprintPokerPayload: endSprintPokerTeamOnNext,
  JoinTeamPayload: joinTeamTeamOnNext,
  RemoveOrgUsersPayload: removeOrgUsersTeamOnNext,
  PushInvitationPayload: pushInvitationTeamOnNext
} as const

const updateHandlers = {
  AddAgendaItemPayload: addAgendaItemUpdater,
  RemoveAgendaItemPayload: removeAgendaItemUpdater,
  UpdateAgendaItemPayload: updateAgendaItemUpdater,
  AcceptTeamInvitationPayload: acceptTeamInvitationTeamUpdater,
  AddPokerTemplateDimensionPayload: addPokerTemplateDimensionTeamUpdater,
  AddPokerTemplateScalePayload: addPokerTemplateScaleTeamUpdater,
  AddTeamHealthTemplatePayload: addTeamHealthTemplateTeamUpdater,
  AddPromptTemplatePayload: addPromptTemplateTeamUpdater,
  AddPokerTemplatePayload: addPokerTemplateTeamUpdater,
  AddTemplatePromptPayload: addTemplatePromptTeamUpdater,
  ArchiveTeamPayload: archiveTeamTeamUpdater,
  BatchArchiveTasksPayload: batchArchiveTasksTaskUpdater,
  EndCheckInPayload: endCheckInTeamUpdater,
  EndRetrospectivePayload: endRetrospectiveTeamUpdater,
  EndSprintPokerPayload: endSprintPokerTeamUpdater,
  EndTeamPromptPayload: endTeamPromptTeamUpdater,
  EndTeamHealthPayload: endTeamHealthTeamUpdater,
  MovePokerTemplateDimensionPayload: movePokerTemplateDimensionTeamUpdater,
  MoveTemplatePromptPayload: moveTemplatePromptTeamUpdater,
  NavigateMeetingPayload: navigateMeetingTeamUpdater,
  RemoveOrgUsersPayload: removeOrgUsersTeamUpdater,
  RemovePokerTemplatePayload: removePokerTemplateTeamUpdater,
  RemovePokerTemplateDimensionPayload: removePokerTemplateDimensionTeamUpdater,
  RemovePromptTemplatePayload: removePromptTemplateTeamUpdater,
  RemoveTemplatePromptPayload: removeTemplatePromptTeamUpdater,
  RemoveTeamMemberPayload: removeTeamMemberTeamUpdater
} as const

export default createSubscription(subscription, onNextHandlers, updateHandlers)

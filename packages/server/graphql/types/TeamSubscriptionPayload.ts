import graphQLSubscriptionType from '../graphQLSubscriptionType'
import AcceptTeamInvitationPayload from './AcceptTeamInvitationPayload'
import AddAgendaItemPayload from './AddAgendaItemPayload'
import AddAtlassianAuthPayload from './AddAtlassianAuthPayload'
import AddGitHubAuthPayload from './AddGitHubAuthPayload'
import {AddIntegrationProviderSuccess} from './AddIntegrationProviderPayload'
import AddPokerTemplateDimensionPayload from './AddPokerTemplateDimensionPayload'
import AddPokerTemplatePayload from './AddPokerTemplatePayload'
import AddPokerTemplateScalePayload from './AddPokerTemplateScalePayload'
import AddPokerTemplateScaleValuePayload from './AddPokerTemplateScaleValuePayload'
import AddReflectTemplatePayload from './AddReflectTemplatePayload'
import AddReflectTemplatePromptPayload from './AddReflectTemplatePromptPayload'
import AddSlackAuthPayload from './AddSlackAuthPayload'
import AddTeamPayload from './AddTeamPayload'
import ArchiveTeamPayload from './ArchiveTeamPayload'
import DenyPushInvitationPayload from './DenyPushInvitationPayload'
import DowngradeToPersonalPayload from './DowngradeToPersonalPayload'
import {EndCheckInSuccess} from './EndCheckInPayload'
import EndNewMeetingPayload from './EndNewMeetingPayload'
import {EndRetrospectiveSuccess} from './EndRetrospectivePayload'
import {EndSprintPokerSuccess} from './EndSprintPokerPayload'
import MovePokerTemplateDimensionPayload from './MovePokerTemplateDimensionPayload'
import {MovePokerTemplateScaleValueSuccess} from './MovePokerTemplateScaleValuePayload'
import MoveReflectTemplatePromptPayload from './MoveReflectTemplatePromptPayload'
import NavigateMeetingPayload from './NavigateMeetingPayload'
import {PersistJiraSearchQuerySuccess} from './PersistJiraSearchQueryPayload'
import PokerTemplateDimensionUpdateDescriptionPayload from './PokerTemplateDimensionUpdateDescriptionPayload'
import PromoteToTeamLeadPayload from './PromoteToTeamLeadPayload'
import PushInvitationPayload from './PushInvitationPayload'
import ReflectTemplatePromptUpdateDescriptionPayload from './ReflectTemplatePromptUpdateDescriptionPayload'
import ReflectTemplatePromptUpdateGroupColorPayload from './ReflectTemplatePromptUpdateGroupColorPayload'
import RemoveAgendaItemPayload from './RemoveAgendaItemPayload'
import RemoveAtlassianAuthPayload from './RemoveAtlassianAuthPayload'
import RemoveGitHubAuthPayload from './RemoveGitHubAuthPayload'
import RemoveOrgUserPayload from './RemoveOrgUserPayload'
import RemovePokerTemplateDimensionPayload from './RemovePokerTemplateDimensionPayload'
import RemovePokerTemplatePayload from './RemovePokerTemplatePayload'
import RemovePokerTemplateScalePayload from './RemovePokerTemplateScalePayload'
import RemovePokerTemplateScaleValuePayload from './RemovePokerTemplateScaleValuePayload'
import RemoveReflectTemplatePayload from './RemoveReflectTemplatePayload'
import RemoveReflectTemplatePromptPayload from './RemoveReflectTemplatePromptPayload'
import RemoveSlackAuthPayload from './RemoveSlackAuthPayload'
import RemoveTeamMemberPayload from './RemoveTeamMemberPayload'
import {RenameMeetingSuccess} from './RenameMeetingPayload'
import RenameMeetingTemplatePayload from './RenameMeetingTemplatePayload'
import RenamePokerTemplateDimensionPayload from './RenamePokerTemplateDimensionPayload'
import RenamePokerTemplatePayload from './RenamePokerTemplatePayload'
import RenamePokerTemplateScalePayload from './RenamePokerTemplateScalePayload'
import RenameReflectTemplatePromptPayload from './RenameReflectTemplatePromptPayload'
import SelectTemplatePayload from './SelectTemplatePayload'
import {SetAppLocationSuccess} from './SetAppLocationPayload'
import SetCheckInEnabledPayload from './SetCheckInEnabledPayload'
import {SetDefaultSlackChannelSuccess} from './SetDefaultSlackChannelPayload'
import SetSlackNotificationPayload from './SetSlackNotificationPayload'
import {StartCheckInSuccess} from './StartCheckInPayload'
import StartNewMeetingPayload from './StartNewMeetingPayload'
import {StartRetrospectiveSuccess} from './StartRetrospectivePayload'
import {StartSprintPokerSuccess} from './StartSprintPokerPayload'
import {StartTeamPromptSuccess} from './StartTeamPromptPayload'
import UpdateAgendaItemPayload from './UpdateAgendaItemPayload'
import UpdateCreditCardPayload from './UpdateCreditCardPayload'
import {UpdateGitHubDimensionFieldSuccess} from './UpdateGitHubDimensionFieldPayload'
import {UpdateIntegrationProviderSuccess} from './UpdateIntegrationProviderPayload'
import {UpdateJiraDimensionFieldSuccess} from './UpdateJiraDimensionFieldPayload'
import UpdatePokerTemplateDimensionScalePayload from './UpdatePokerTemplateDimensionScalePayload'
import UpdatePokerTemplateScaleValuePayload from './UpdatePokerTemplateScaleValuePayload'
import UpdateTeamNamePayload from './UpdateTeamNamePayload'
import UpdateUserProfilePayload from './UpdateUserProfilePayload'
import UpgradeToProPayload from './UpgradeToProPayload'

const types = [
  AcceptTeamInvitationPayload,
  AddAgendaItemPayload,
  AddAtlassianAuthPayload,
  AddGitHubAuthPayload,
  AddIntegrationProviderSuccess,
  AddSlackAuthPayload,
  AddTeamPayload,
  ArchiveTeamPayload,
  DenyPushInvitationPayload,
  DowngradeToPersonalPayload,
  EndCheckInSuccess,
  EndNewMeetingPayload,
  EndRetrospectiveSuccess,
  EndSprintPokerSuccess,
  NavigateMeetingPayload,
  PushInvitationPayload,
  PromoteToTeamLeadPayload,
  RemoveAgendaItemPayload,
  RemoveOrgUserPayload,
  RemoveTeamMemberPayload,
  RenameMeetingSuccess,
  SelectTemplatePayload,
  StartCheckInSuccess,
  StartNewMeetingPayload,
  StartRetrospectiveSuccess,
  StartSprintPokerSuccess,
  StartTeamPromptSuccess,
  UpdateAgendaItemPayload,
  UpdateCreditCardPayload,
  UpdateTeamNamePayload,
  UpgradeToProPayload,
  AddReflectTemplatePayload,
  AddPokerTemplatePayload,
  AddReflectTemplatePromptPayload,
  AddPokerTemplateDimensionPayload,
  AddPokerTemplateScalePayload,
  AddPokerTemplateScaleValuePayload,
  MoveReflectTemplatePromptPayload,
  MovePokerTemplateDimensionPayload,
  ReflectTemplatePromptUpdateDescriptionPayload,
  PokerTemplateDimensionUpdateDescriptionPayload,
  ReflectTemplatePromptUpdateGroupColorPayload,
  RemoveAtlassianAuthPayload,
  RemoveGitHubAuthPayload,
  RemoveSlackAuthPayload,
  RemoveReflectTemplatePayload,
  RemovePokerTemplatePayload,
  RemoveReflectTemplatePromptPayload,
  RemovePokerTemplateDimensionPayload,
  RemovePokerTemplateScalePayload,
  RenameMeetingTemplatePayload,
  RenamePokerTemplatePayload,
  RenameReflectTemplatePromptPayload,
  RenamePokerTemplateDimensionPayload,
  RenamePokerTemplateScalePayload,
  RemovePokerTemplateScaleValuePayload,
  SetCheckInEnabledPayload,
  SetSlackNotificationPayload,
  UpdatePokerTemplateDimensionScalePayload,
  UpdatePokerTemplateScaleValuePayload,
  UpdateUserProfilePayload,
  PersistJiraSearchQuerySuccess,
  MovePokerTemplateScaleValueSuccess,
  UpdateJiraDimensionFieldSuccess,
  SetDefaultSlackChannelSuccess,
  SetAppLocationSuccess,
  UpdateGitHubDimensionFieldSuccess,
  UpdateIntegrationProviderSuccess
]

export default graphQLSubscriptionType('TeamSubscriptionPayload', types)

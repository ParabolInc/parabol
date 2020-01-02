import graphQLSubscriptionType from '../graphQLSubscriptionType'
import AcceptTeamInvitationPayload from './AcceptTeamInvitationPayload'
import AddAgendaItemPayload from './AddAgendaItemPayload'
import AddAtlassianAuthPayload from './AddAtlassianAuthPayload'
import AddAzureDevopsAuthPayload from './AddAzureDevopsAuthPayload'
import AddGitHubAuthPayload from './AddGitHubAuthPayload'
import AddReflectTemplatePayload from './AddReflectTemplatePayload'
import AddReflectTemplatePromptPayload from './AddReflectTemplatePromptPayload'
import AddTeamPayload from './AddTeamPayload'
import ArchiveTeamPayload from './ArchiveTeamPayload'
import DowngradeToPersonalPayload from './DowngradeToPersonalPayload'
import EndNewMeetingPayload from './EndNewMeetingPayload'
import MoveReflectTemplatePromptPayload from './MoveReflectTemplatePromptPayload'
import PromoteToTeamLeadPayload from './PromoteToTeamLeadPayload'
import ReflectTemplatePromptUpdateDescriptionPayload from './ReflectTemplatePromptUpdateDescriptionPayload'
import RemoveAgendaItemPayload from './RemoveAgendaItemPayload'
import RemoveAtlassianAuthPayload from './RemoveAtlassianAuthPayload'
import RemoveAzureDevopsAuthPayload from './RemoveAzureDevopsAuthPayload'
import RemoveGitHubAuthPayload from './RemoveGitHubAuthPayload'
import RemoveOrgUserPayload from './RemoveOrgUserPayload'
import RemoveReflectTemplatePayload from './RemoveReflectTemplatePayload'
import RemoveReflectTemplatePromptPayload from './RemoveReflectTemplatePromptPayload'
import RemoveTeamMemberPayload from './RemoveTeamMemberPayload'
import RenameReflectTemplatePayload from './RenameReflectTemplatePayload'
import RenameReflectTemplatePromptPayload from './RenameReflectTemplatePromptPayload'
import SelectRetroTemplatePayload from './SelectRetroTemplatePayload'
import StartNewMeetingPayload from './StartNewMeetingPayload'
import UpdateAgendaItemPayload from './UpdateAgendaItemPayload'
import UpdateCreditCardPayload from './UpdateCreditCardPayload'
import UpdateTeamNamePayload from './UpdateTeamNamePayload'
import UpgradeToProPayload from './UpgradeToProPayload'
import RemoveSlackAuthPayload from './RemoveSlackAuthPayload'
import AddSlackAuthPayload from './AddSlackAuthPayload'
import UpdateUserProfilePayload from './UpdateUserProfilePayload'
import PushInvitationPayload from './PushInvitationPayload'
import DenyPushInvitationPayload from './DenyPushInvitationPayload'
import SetCheckInEnabledPayload from './SetCheckInEnabledPayload'
import SetSlackNotificationPayload from './SetSlackNotificationPayload'
import {RenameMeetingSuccess} from './RenameMeetingPayload'
import NavigateMeetingPayload from './NavigateMeetingPayload'

const types = [
  AcceptTeamInvitationPayload,
  AddAgendaItemPayload,
  AddAtlassianAuthPayload,
  AddAzureDevopsAuthPayload,
  AddGitHubAuthPayload,
  AddSlackAuthPayload,
  AddTeamPayload,
  ArchiveTeamPayload,
  DenyPushInvitationPayload,
  DowngradeToPersonalPayload,
  EndNewMeetingPayload,
  NavigateMeetingPayload,
  PushInvitationPayload,
  PromoteToTeamLeadPayload,
  RemoveAgendaItemPayload,
  RemoveOrgUserPayload,
  RemoveTeamMemberPayload,
  RenameMeetingSuccess,
  SelectRetroTemplatePayload,
  StartNewMeetingPayload,
  UpdateAgendaItemPayload,
  UpdateCreditCardPayload,
  UpdateTeamNamePayload,
  UpgradeToProPayload,
  AddReflectTemplatePayload,
  AddReflectTemplatePromptPayload,
  MoveReflectTemplatePromptPayload,
  ReflectTemplatePromptUpdateDescriptionPayload,
  RemoveAtlassianAuthPayload,
  RemoveAzureDevopsAuthPayload,
  RemoveGitHubAuthPayload,
  RemoveSlackAuthPayload,
  RemoveReflectTemplatePayload,
  RemoveReflectTemplatePromptPayload,
  RenameReflectTemplatePayload,
  RenameReflectTemplatePromptPayload,
  SetCheckInEnabledPayload,
  SetSlackNotificationPayload,
  UpdateUserProfilePayload
]

export default graphQLSubscriptionType('TeamSubscriptionPayload', types)

import graphQLSubscriptionType from '../graphQLSubscriptionType'
import AcceptTeamInvitationPayload from './AcceptTeamInvitationPayload'
import AddAgendaItemPayload from './AddAgendaItemPayload'
import AddAtlassianAuthPayload from './AddAtlassianAuthPayload'
import AddGitHubAuthPayload from './AddGitHubAuthPayload'
import AddReflectTemplatePayload from './AddReflectTemplatePayload'
import AddReflectTemplatePromptPayload from './AddReflectTemplatePromptPayload'
import AddSlackAuthPayload from './AddSlackAuthPayload'
import AddTeamPayload from './AddTeamPayload'
import ArchiveTeamPayload from './ArchiveTeamPayload'
import DenyPushInvitationPayload from './DenyPushInvitationPayload'
import DowngradeToPersonalPayload from './DowngradeToPersonalPayload'
import EndNewMeetingPayload from './EndNewMeetingPayload'
import {EndSprintPokerSuccess} from './EndSprintPokerPayload'
import MoveReflectTemplatePromptPayload from './MoveReflectTemplatePromptPayload'
import NavigateMeetingPayload from './NavigateMeetingPayload'
import PromoteToTeamLeadPayload from './PromoteToTeamLeadPayload'
import PushInvitationPayload from './PushInvitationPayload'
import ReflectTemplatePromptUpdateDescriptionPayload from './ReflectTemplatePromptUpdateDescriptionPayload'
import ReflectTemplatePromptUpdateGroupColorPayload from './ReflectTemplatePromptUpdateGroupColorPayload'
import RemoveAgendaItemPayload from './RemoveAgendaItemPayload'
import RemoveAtlassianAuthPayload from './RemoveAtlassianAuthPayload'
import RemoveGitHubAuthPayload from './RemoveGitHubAuthPayload'
import RemoveOrgUserPayload from './RemoveOrgUserPayload'
import RemoveReflectTemplatePayload from './RemoveReflectTemplatePayload'
import RemoveReflectTemplatePromptPayload from './RemoveReflectTemplatePromptPayload'
import RemoveSlackAuthPayload from './RemoveSlackAuthPayload'
import RemoveTeamMemberPayload from './RemoveTeamMemberPayload'
import {RenameMeetingSuccess} from './RenameMeetingPayload'
import RenameReflectTemplatePayload from './RenameReflectTemplatePayload'
import RenameReflectTemplatePromptPayload from './RenameReflectTemplatePromptPayload'
import SelectRetroTemplatePayload from './SelectRetroTemplatePayload'
import SetCheckInEnabledPayload from './SetCheckInEnabledPayload'
import SetSlackNotificationPayload from './SetSlackNotificationPayload'
import StartNewMeetingPayload from './StartNewMeetingPayload'
import {StartSprintPokerSuccess} from './StartSprintPokerPayload'
import UpdateAgendaItemPayload from './UpdateAgendaItemPayload'
import UpdateCreditCardPayload from './UpdateCreditCardPayload'
import UpdateTeamNamePayload from './UpdateTeamNamePayload'
import UpdateUserProfilePayload from './UpdateUserProfilePayload'
import UpgradeToProPayload from './UpgradeToProPayload'

const types = [
  AcceptTeamInvitationPayload,
  AddAgendaItemPayload,
  AddAtlassianAuthPayload,
  AddGitHubAuthPayload,
  AddSlackAuthPayload,
  AddTeamPayload,
  ArchiveTeamPayload,
  DenyPushInvitationPayload,
  DowngradeToPersonalPayload,
  EndNewMeetingPayload,
  EndSprintPokerSuccess,
  NavigateMeetingPayload,
  PushInvitationPayload,
  PromoteToTeamLeadPayload,
  RemoveAgendaItemPayload,
  RemoveOrgUserPayload,
  RemoveTeamMemberPayload,
  RenameMeetingSuccess,
  SelectRetroTemplatePayload,
  StartNewMeetingPayload,
  StartSprintPokerSuccess,
  UpdateAgendaItemPayload,
  UpdateCreditCardPayload,
  UpdateTeamNamePayload,
  UpgradeToProPayload,
  AddReflectTemplatePayload,
  AddReflectTemplatePromptPayload,
  MoveReflectTemplatePromptPayload,
  ReflectTemplatePromptUpdateDescriptionPayload,
  ReflectTemplatePromptUpdateGroupColorPayload,
  RemoveAtlassianAuthPayload,
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

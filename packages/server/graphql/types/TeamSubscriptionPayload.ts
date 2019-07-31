import graphQLSubscriptionType from '../graphQLSubscriptionType'
import AcceptTeamInvitationPayload from './AcceptTeamInvitationPayload'
import AddAgendaItemPayload from './AddAgendaItemPayload'
import AddAtlassianAuthPayload from './AddAtlassianAuthPayload'
import AddGitHubAuthPayload from './AddGitHubAuthPayload'
import AddReflectTemplatePayload from './AddReflectTemplatePayload'
import AddReflectTemplatePromptPayload from './AddReflectTemplatePromptPayload'
import AddTeamPayload from './AddTeamPayload'
import ArchiveTeamPayload from './ArchiveTeamPayload'
import AutoGroupReflectionsPayload from './AutoGroupReflectionsPayload'
import CreateReflectionGroupPayload from './CreateReflectionGroupPayload'
import CreateReflectionPayload from './CreateReflectionPayload'
import DowngradeToPersonalPayload from './DowngradeToPersonalPayload'
import DragDiscussionTopicPayload from './DragDiscussionTopicPayload'
import EditReflectionPayload from './EditReflectionPayload'
import EndDraggingReflectionPayload from './EndDraggingReflectionPayload'
import EndNewMeetingPayload from './EndNewMeetingPayload'
import MoveReflectTemplatePromptPayload from './MoveReflectTemplatePromptPayload'
import NavigateMeetingPayload from './NavigateMeetingPayload'
import NewMeetingCheckInPayload from './NewMeetingCheckInPayload'
import PromoteNewMeetingFacilitatorPayload from './PromoteNewMeetingFacilitatorPayload'
import PromoteToTeamLeadPayload from './PromoteToTeamLeadPayload'
import ReflectTemplatePromptUpdateDescriptionPayload from './ReflectTemplatePromptUpdateDescriptionPayload'
import RemoveAgendaItemPayload from './RemoveAgendaItemPayload'
import RemoveAtlassianAuthPayload from './RemoveAtlassianAuthPayload'
import RemoveGitHubAuthPayload from './RemoveGitHubAuthPayload'
import RemoveOrgUserPayload from './RemoveOrgUserPayload'
import RemoveReflectionPayload from './RemoveReflectionPayload'
import RemoveReflectTemplatePayload from './RemoveReflectTemplatePayload'
import RemoveReflectTemplatePromptPayload from './RemoveReflectTemplatePromptPayload'
import RemoveTeamMemberPayload from './RemoveTeamMemberPayload'
import RenameReflectTemplatePayload from './RenameReflectTemplatePayload'
import RenameReflectTemplatePromptPayload from './RenameReflectTemplatePromptPayload'
import SelectRetroTemplatePayload from './SelectRetroTemplatePayload'
import SetPhaseFocusPayload from './SetPhaseFocusPayload'
import StartDraggingReflectionPayload from './StartDraggingReflectionPayload'
import StartNewMeetingPayload from './StartNewMeetingPayload'
import UpdateAgendaItemPayload from './UpdateAgendaItemPayload'
import UpdateCreditCardPayload from './UpdateCreditCardPayload'
import UpdateDragLocationPayload from './UpdateDragLocationPayload'
import UpdateNewCheckInQuestionPayload from './UpdateNewCheckInQuestionPayload'
import UpdateReflectionContentPayload from './UpdateReflectionContentPayload'
import UpdateReflectionGroupTitlePayload from './UpdateReflectionGroupTitlePayload'
import UpdateTeamNamePayload from './UpdateTeamNamePayload'
import UpgradeToProPayload from './UpgradeToProPayload'
import VoteForReflectionGroupPayload from './VoteForReflectionGroupPayload'
import RemoveSlackAuthPayload from './RemoveSlackAuthPayload'
import AddSlackAuthPayload from './AddSlackAuthPayload'
import SetStageTimerPayload from './SetStageTimerPayload'
import UpdateUserProfilePayload from './UpdateUserProfilePayload'
import PushInvitationPayload from './PushInvitationPayload'
import DenyPushInvitationPayload from './DenyPushInvitationPayload'

const types = [
  AcceptTeamInvitationPayload,
  AddAgendaItemPayload,
  AddAtlassianAuthPayload,
  AddGitHubAuthPayload,
  AddSlackAuthPayload,
  AddTeamPayload,
  ArchiveTeamPayload,
  AutoGroupReflectionsPayload,
  CreateReflectionPayload,
  CreateReflectionGroupPayload,
  DenyPushInvitationPayload,
  DowngradeToPersonalPayload,
  DragDiscussionTopicPayload,
  EndDraggingReflectionPayload,
  EditReflectionPayload,
  EndNewMeetingPayload,
  NavigateMeetingPayload,
  NewMeetingCheckInPayload,
  PushInvitationPayload,
  PromoteNewMeetingFacilitatorPayload,
  PromoteToTeamLeadPayload,
  RemoveAgendaItemPayload,
  RemoveOrgUserPayload,
  RemoveReflectionPayload,
  RemoveTeamMemberPayload,
  SelectRetroTemplatePayload,
  SetPhaseFocusPayload,
  SetStageTimerPayload,
  StartDraggingReflectionPayload,
  StartNewMeetingPayload,
  UpdateAgendaItemPayload,
  UpdateCreditCardPayload,
  UpdateDragLocationPayload,
  UpdateNewCheckInQuestionPayload,
  UpdateReflectionContentPayload,
  UpdateReflectionGroupTitlePayload,
  UpdateTeamNamePayload,
  UpgradeToProPayload,
  VoteForReflectionGroupPayload,
  AddReflectTemplatePayload,
  AddReflectTemplatePromptPayload,
  MoveReflectTemplatePromptPayload,
  ReflectTemplatePromptUpdateDescriptionPayload,
  RemoveAtlassianAuthPayload,
  RemoveGitHubAuthPayload,
  RemoveSlackAuthPayload,
  RemoveReflectTemplatePayload,
  RemoveReflectTemplatePromptPayload,
  RenameReflectTemplatePayload,
  RenameReflectTemplatePromptPayload,
  UpdateUserProfilePayload
]

export default graphQLSubscriptionType('TeamSubscriptionPayload', types)

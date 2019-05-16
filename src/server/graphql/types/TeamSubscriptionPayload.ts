import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType'
import AcceptTeamInvitationPayload from 'server/graphql/types/AcceptTeamInvitationPayload'
import AddAgendaItemPayload from 'server/graphql/types/AddAgendaItemPayload'
import AddAtlassianAuthPayload from 'server/graphql/types/AddAtlassianAuthPayload'
import AddGitHubAuthPayload from 'server/graphql/types/AddGitHubAuthPayload'
import AddReflectTemplatePayload from 'server/graphql/types/AddReflectTemplatePayload'
import AddReflectTemplatePromptPayload from 'server/graphql/types/AddReflectTemplatePromptPayload'
import AddTeamPayload from 'server/graphql/types/AddTeamPayload'
import ArchiveTeamPayload from 'server/graphql/types/ArchiveTeamPayload'
import AutoGroupReflectionsPayload from 'server/graphql/types/AutoGroupReflectionsPayload'
import CreateReflectionGroupPayload from 'server/graphql/types/CreateReflectionGroupPayload'
import CreateReflectionPayload from 'server/graphql/types/CreateReflectionPayload'
import DowngradeToPersonalPayload from 'server/graphql/types/DowngradeToPersonalPayload'
import DragDiscussionTopicPayload from 'server/graphql/types/DragDiscussionTopicPayload'
import EditReflectionPayload from 'server/graphql/types/EditReflectionPayload'
import EndDraggingReflectionPayload from 'server/graphql/types/EndDraggingReflectionPayload'
import EndMeetingPayload from 'server/graphql/types/EndMeetingPayload'
import EndNewMeetingPayload from 'server/graphql/types/EndNewMeetingPayload'
import MoveReflectTemplatePromptPayload from 'server/graphql/types/MoveReflectTemplatePromptPayload'
import NavigateMeetingPayload from 'server/graphql/types/NavigateMeetingPayload'
import NewMeetingCheckInPayload from 'server/graphql/types/NewMeetingCheckInPayload'
import PromoteNewMeetingFacilitatorPayload from 'server/graphql/types/PromoteNewMeetingFacilitatorPayload'
import PromoteToTeamLeadPayload from 'server/graphql/types/PromoteToTeamLeadPayload'
import ReflectTemplatePromptUpdateDescriptionPayload from 'server/graphql/types/ReflectTemplatePromptUpdateDescriptionPayload'
import RemoveAgendaItemPayload from 'server/graphql/types/RemoveAgendaItemPayload'
import RemoveAtlassianAuthPayload from 'server/graphql/types/RemoveAtlassianAuthPayload'
import RemoveGitHubAuthPayload from 'server/graphql/types/RemoveGitHubAuthPayload'
import RemoveOrgUserPayload from 'server/graphql/types/RemoveOrgUserPayload'
import RemoveReflectionPayload from 'server/graphql/types/RemoveReflectionPayload'
import RemoveReflectTemplatePayload from 'server/graphql/types/RemoveReflectTemplatePayload'
import RemoveReflectTemplatePromptPayload from 'server/graphql/types/RemoveReflectTemplatePromptPayload'
import RemoveTeamMemberPayload from 'server/graphql/types/RemoveTeamMemberPayload'
import RenameReflectTemplatePayload from 'server/graphql/types/RenameReflectTemplatePayload'
import RenameReflectTemplatePromptPayload from 'server/graphql/types/RenameReflectTemplatePromptPayload'
import SelectRetroTemplatePayload from 'server/graphql/types/SelectRetroTemplatePayload'
import SetPhaseFocusPayload from 'server/graphql/types/SetPhaseFocusPayload'
import StartDraggingReflectionPayload from 'server/graphql/types/StartDraggingReflectionPayload'
import StartNewMeetingPayload from 'server/graphql/types/StartNewMeetingPayload'
import UpdateAgendaItemPayload from 'server/graphql/types/UpdateAgendaItemPayload'
import UpdateCreditCardPayload from 'server/graphql/types/UpdateCreditCardPayload'
import UpdateDragLocationPayload from 'server/graphql/types/UpdateDragLocationPayload'
import UpdateNewCheckInQuestionPayload from 'server/graphql/types/UpdateNewCheckInQuestionPayload'
import UpdateReflectionContentPayload from 'server/graphql/types/UpdateReflectionContentPayload'
import UpdateReflectionGroupTitlePayload from 'server/graphql/types/UpdateReflectionGroupTitlePayload'
import UpdateTeamNamePayload from 'server/graphql/types/UpdateTeamNamePayload'
import UpgradeToProPayload from 'server/graphql/types/UpgradeToProPayload'
import VoteForReflectionGroupPayload from 'server/graphql/types/VoteForReflectionGroupPayload'

const types = [
  AcceptTeamInvitationPayload,
  AddAgendaItemPayload,
  AddAtlassianAuthPayload,
  AddGitHubAuthPayload,
  AddTeamPayload,
  ArchiveTeamPayload,
  AutoGroupReflectionsPayload,
  CreateReflectionPayload,
  CreateReflectionGroupPayload,
  DowngradeToPersonalPayload,
  DragDiscussionTopicPayload,
  EndDraggingReflectionPayload,
  EditReflectionPayload,
  EndMeetingPayload,
  EndNewMeetingPayload,
  NavigateMeetingPayload,
  NewMeetingCheckInPayload,
  PromoteNewMeetingFacilitatorPayload,
  PromoteToTeamLeadPayload,
  RemoveAgendaItemPayload,
  RemoveOrgUserPayload,
  RemoveReflectionPayload,
  RemoveTeamMemberPayload,
  SelectRetroTemplatePayload,
  SetPhaseFocusPayload,
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
  RemoveReflectTemplatePayload,
  RemoveReflectTemplatePromptPayload,
  RenameReflectTemplatePayload,
  RenameReflectTemplatePromptPayload
]

export default graphQLSubscriptionType('TeamSubscriptionPayload', types)

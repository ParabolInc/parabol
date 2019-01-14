import graphQLSubscriptionType from 'server/graphql/graphQLSubscriptionType'
import AddTeamPayload from 'server/graphql/types/AddTeamPayload'
import ArchiveTeamPayload from 'server/graphql/types/ArchiveTeamPayload'
import EndMeetingPayload from 'server/graphql/types/EndMeetingPayload'
import KillMeetingPayload from 'server/graphql/types/KillMeetingPayload'
import MoveMeetingPayload from 'server/graphql/types/MoveMeetingPayload'
import NavigateMeetingPayload from 'server/graphql/types/NavigateMeetingPayload'
import PromoteFacilitatorPayload from 'server/graphql/types/PromoteFacilitatorPayload'
import RemoveTeamMemberPayload from 'server/graphql/types/RemoveTeamMemberPayload'
import RequestFacilitatorPayload from 'server/graphql/types/RequestFacilitatorPayload'
import StartMeetingPayload from 'server/graphql/types/StartMeetingPayload'
import StartNewMeetingPayload from 'server/graphql/types/StartNewMeetingPayload'
import UpdateCheckInQuestionPayload from 'server/graphql/types/UpdateCheckInQuestionPayload'
import UpdateNewCheckInQuestionPayload from 'server/graphql/types/UpdateNewCheckInQuestionPayload'
import UpdateTeamNamePayload from 'server/graphql/types/UpdateTeamNamePayload'
import UpgradeToProPayload from 'server/graphql/types/UpgradeToProPayload'
import RemoveOrgUserPayload from 'server/graphql/types/RemoveOrgUserPayload'
import UpdateCreditCardPayload from 'server/graphql/types/UpdateCreditCardPayload'
import AcceptTeamInvitePayload from 'server/graphql/types/AcceptTeamInvitePayload'
import EndNewMeetingPayload from 'server/graphql/types/EndNewMeetingPayload'
import PromoteNewMeetingFacilitatorPayload from 'server/graphql/types/PromoteNewMeetingFacilitatorPayload'
import CreateReflectionPayload from 'server/graphql/types/CreateReflectionPayload'
import UpdateReflectionContentPayload from 'server/graphql/types/UpdateReflectionContentPayload'
import EditReflectionPayload from 'server/graphql/types/EditReflectionPayload'
import RemoveReflectionPayload from 'server/graphql/types/RemoveReflectionPayload'
import CreateReflectionGroupPayload from 'server/graphql/types/CreateReflectionGroupPayload'
import UpdateReflectionGroupTitlePayload from 'server/graphql/types/UpdateReflectionGroupTitlePayload'
import VoteForReflectionGroupPayload from 'server/graphql/types/VoteForReflectionGroupPayload'
import NewMeetingCheckInPayload from 'server/graphql/types/NewMeetingCheckInPayload'
import AutoGroupReflectionsPayload from 'server/graphql/types/AutoGroupReflectionsPayload'
import EndDraggingReflectionPayload from 'server/graphql/types/EndDraggingReflectionPayload'
import UpdateDragLocationPayload from 'server/graphql/types/UpdateDragLocationPayload'
import DragDiscussionTopicPayload from 'server/graphql/types/DragDiscussionTopicPayload'
import SetPhaseFocusPayload from 'server/graphql/types/SetPhaseFocusPayload'
import StartDraggingReflectionPayload from 'server/graphql/types/StartDraggingReflectionPayload'
import SelectRetroTemplatePayload from 'server/graphql/types/SelectRetroTemplatePayload'
import AddReflectTemplatePayload from 'server/graphql/types/AddReflectTemplatePayload'
import AddReflectTemplatePromptPayload from 'server/graphql/types/AddReflectTemplatePromptPayload'
import MoveReflectTemplatePromptPayload from 'server/graphql/types/MoveReflectTemplatePromptPayload'
import RemoveReflectTemplatePayload from 'server/graphql/types/RemoveReflectTemplatePayload'
import RemoveReflectTemplatePromptPayload from 'server/graphql/types/RemoveReflectTemplatePromptPayload'
import RenameReflectTemplatePayload from 'server/graphql/types/RenameReflectTemplatePayload'
import RenameReflectTemplatePromptPayload from 'server/graphql/types/RenameReflectTemplatePromptPayload'
import DowngradeToPersonalPayload from 'server/graphql/types/DowngradeToPersonalPayload'
import AcceptTeamInvitationPayload from 'server/graphql/types/AcceptTeamInvitationPayload'
import PromoteToTeamLeadPayload from 'server/graphql/types/PromoteToTeamLeadPayload'

const types = [
  AcceptTeamInvitationPayload,
  AcceptTeamInvitePayload,
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
  KillMeetingPayload,
  EndNewMeetingPayload,
  MoveMeetingPayload,
  NavigateMeetingPayload,
  NewMeetingCheckInPayload,
  PromoteFacilitatorPayload,
  PromoteNewMeetingFacilitatorPayload,
  PromoteToTeamLeadPayload,
  RequestFacilitatorPayload,
  RemoveOrgUserPayload,
  RemoveReflectionPayload,
  RemoveTeamMemberPayload,
  SelectRetroTemplatePayload,
  SetPhaseFocusPayload,
  StartDraggingReflectionPayload,
  StartMeetingPayload,
  StartNewMeetingPayload,
  UpdateCheckInQuestionPayload,
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
  RemoveReflectTemplatePayload,
  RemoveReflectTemplatePromptPayload,
  RenameReflectTemplatePayload,
  RenameReflectTemplatePromptPayload
]

export default graphQLSubscriptionType('TeamSubscriptionPayload', types)

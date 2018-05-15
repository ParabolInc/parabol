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
import UpdateReflectionLocationPayload from 'server/graphql/types/UpdateReflectionLocationPayload'
import RemoveReflectionPayload from 'server/graphql/types/RemoveReflectionPayload'
import CreateReflectionGroupPayload from 'server/graphql/types/CreateReflectionGroupPayload'
import UpdateReflectionGroupTitlePayload from 'server/graphql/types/UpdateReflectionGroupTitlePayload'
import VoteForReflectionGroupPayload from 'server/graphql/types/VoteForReflectionGroupPayload'
import NewMeetingCheckInPayload from 'server/graphql/types/NewMeetingCheckInPayload'
import AutoGroupReflectionsPayload from 'server/graphql/types/AutoGroupReflectionsPayload'
import DragReflectionPayload from 'server/graphql/types/DragReflectionPayload'

const types = [
  AcceptTeamInvitePayload,
  AddTeamPayload,
  ArchiveTeamPayload,
  AutoGroupReflectionsPayload,
  CreateReflectionPayload,
  CreateReflectionGroupPayload,
  DragReflectionPayload,
  EditReflectionPayload,
  EndMeetingPayload,
  KillMeetingPayload,
  EndNewMeetingPayload,
  MoveMeetingPayload,
  NavigateMeetingPayload,
  NewMeetingCheckInPayload,
  PromoteFacilitatorPayload,
  PromoteNewMeetingFacilitatorPayload,
  RequestFacilitatorPayload,
  StartMeetingPayload,
  StartNewMeetingPayload,
  RemoveOrgUserPayload,
  RemoveReflectionPayload,
  RemoveTeamMemberPayload,
  UpdateCheckInQuestionPayload,
  UpdateCreditCardPayload,
  UpdateNewCheckInQuestionPayload,
  UpdateReflectionContentPayload,
  UpdateReflectionGroupTitlePayload,
  UpdateReflectionLocationPayload,
  UpdateTeamNamePayload,
  UpgradeToProPayload,
  VoteForReflectionGroupPayload
]

export default graphQLSubscriptionType('TeamSubscriptionPayload', types)

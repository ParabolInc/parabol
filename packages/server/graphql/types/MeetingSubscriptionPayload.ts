import graphQLSubscriptionType from '../graphQLSubscriptionType'
import AutoGroupReflectionsPayload from './AutoGroupReflectionsPayload'
import CreateReflectionPayload from './CreateReflectionPayload'
import DragDiscussionTopicPayload from './DragDiscussionTopicPayload'
import EditReflectionPayload from './EditReflectionPayload'
import EndDraggingReflectionPayload from './EndDraggingReflectionPayload'
import NavigateMeetingPayload from './NavigateMeetingPayload'
import NewMeetingCheckInPayload from './NewMeetingCheckInPayload'
import PromoteNewMeetingFacilitatorPayload from './PromoteNewMeetingFacilitatorPayload'
import RemoveReflectionPayload from './RemoveReflectionPayload'
import SetPhaseFocusPayload from './SetPhaseFocusPayload'
import StartDraggingReflectionPayload from './StartDraggingReflectionPayload'
import UpdateDragLocationPayload from './UpdateDragLocationPayload'
import UpdateNewCheckInQuestionPayload from './UpdateNewCheckInQuestionPayload'
import UpdateReflectionContentPayload from './UpdateReflectionContentPayload'
import UpdateReflectionGroupTitlePayload from './UpdateReflectionGroupTitlePayload'
import VoteForReflectionGroupPayload from './VoteForReflectionGroupPayload'
import SetStageTimerPayload from './SetStageTimerPayload'
import {RenameMeetingSuccess} from './RenameMeetingPayload'
import {AddReactjiToReflectionSuccess} from './AddReactjiToReflectionPayload'

const types = [
  AddReactjiToReflectionSuccess,
  AutoGroupReflectionsPayload,
  CreateReflectionPayload,
  DragDiscussionTopicPayload,
  EndDraggingReflectionPayload,
  EditReflectionPayload,
  NavigateMeetingPayload,
  NewMeetingCheckInPayload,
  PromoteNewMeetingFacilitatorPayload,
  RemoveReflectionPayload,
  RenameMeetingSuccess,
  SetPhaseFocusPayload,
  SetStageTimerPayload,
  StartDraggingReflectionPayload,
  UpdateDragLocationPayload,
  UpdateNewCheckInQuestionPayload,
  UpdateReflectionContentPayload,
  UpdateReflectionGroupTitlePayload,
  VoteForReflectionGroupPayload
]

export default graphQLSubscriptionType('MeetingSubscriptionPayload', types)

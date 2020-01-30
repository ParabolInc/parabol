import graphQLSubscriptionType from '../graphQLSubscriptionType'
import {AddReactjiToReflectionSuccess} from './AddReactjiToReflectionPayload'
import AutoGroupReflectionsPayload from './AutoGroupReflectionsPayload'
import CreateReflectionPayload from './CreateReflectionPayload'
import DragDiscussionTopicPayload from './DragDiscussionTopicPayload'
import EditReflectionPayload from './EditReflectionPayload'
import EndDraggingReflectionPayload from './EndDraggingReflectionPayload'
import NewMeetingCheckInPayload from './NewMeetingCheckInPayload'
import PromoteNewMeetingFacilitatorPayload from './PromoteNewMeetingFacilitatorPayload'
import RemoveReflectionPayload from './RemoveReflectionPayload'
import {SetAppLocationSuccess} from './SetAppLocationPayload'
import SetPhaseFocusPayload from './SetPhaseFocusPayload'
import SetStageTimerPayload from './SetStageTimerPayload'
import StartDraggingReflectionPayload from './StartDraggingReflectionPayload'
import UpdateDragLocationPayload from './UpdateDragLocationPayload'
import UpdateNewCheckInQuestionPayload from './UpdateNewCheckInQuestionPayload'
import UpdateReflectionContentPayload from './UpdateReflectionContentPayload'
import UpdateReflectionGroupTitlePayload from './UpdateReflectionGroupTitlePayload'
import VoteForReflectionGroupPayload from './VoteForReflectionGroupPayload'

const types = [
  AddReactjiToReflectionSuccess,
  AutoGroupReflectionsPayload,
  CreateReflectionPayload,
  DragDiscussionTopicPayload,
  EndDraggingReflectionPayload,
  EditReflectionPayload,
  NewMeetingCheckInPayload,
  PromoteNewMeetingFacilitatorPayload,
  RemoveReflectionPayload,
  SetAppLocationSuccess,
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

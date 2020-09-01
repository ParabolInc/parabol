import graphQLSubscriptionType from '../graphQLSubscriptionType'
import {AddCommentSuccess} from './AddCommentPayload'
import {AddReactjiToReactableSuccess} from './AddReactjiToReactablePayload'
import {AddReactjiToReflectionSuccess} from './AddReactjiToReflectionPayload'
import AutoGroupReflectionsPayload from './AutoGroupReflectionsPayload'
import CreateReflectionPayload from './CreateReflectionPayload'
import {DeleteCommentSuccess} from './DeleteCommentPayload'
import DragDiscussionTopicPayload from './DragDiscussionTopicPayload'
import {DragEstimatingTaskSuccess} from './DragEstimatingTaskPayload'
import EditReflectionPayload from './EditReflectionPayload'
import EndDraggingReflectionPayload from './EndDraggingReflectionPayload'
import {FlagReadyToAdvanceSuccess} from './FlagReadyToAdvancePayload'
import NewMeetingCheckInPayload from './NewMeetingCheckInPayload'
import PromoteNewMeetingFacilitatorPayload from './PromoteNewMeetingFacilitatorPayload'
import RemoveReflectionPayload from './RemoveReflectionPayload'
import {SetAppLocationSuccess} from './SetAppLocationPayload'
import SetPhaseFocusPayload from './SetPhaseFocusPayload'
import SetStageTimerPayload from './SetStageTimerPayload'
import StartDraggingReflectionPayload from './StartDraggingReflectionPayload'
import {UpdateCommentContentSuccess} from './UpdateCommentContentPayload'
import UpdateDragLocationPayload from './UpdateDragLocationPayload'
import UpdateNewCheckInQuestionPayload from './UpdateNewCheckInQuestionPayload'
import UpdateReflectionContentPayload from './UpdateReflectionContentPayload'
import UpdateReflectionGroupTitlePayload from './UpdateReflectionGroupTitlePayload'
import {UpdateRetroMaxVotesSuccess} from './UpdateRetroMaxVotesPayload'
import EditCommentingPayload from './EditCommentingPayload'
import VoteForReflectionGroupPayload from './VoteForReflectionGroupPayload'

const types = [
  AddCommentSuccess,
  AddReactjiToReflectionSuccess, // DEPRECATED
  AddReactjiToReactableSuccess,
  AutoGroupReflectionsPayload,
  CreateReflectionPayload,
  DeleteCommentSuccess,
  DragDiscussionTopicPayload,
  DragEstimatingTaskSuccess,
  EndDraggingReflectionPayload,
  EditCommentingPayload,
  EditReflectionPayload,
  EndDraggingReflectionPayload,
  FlagReadyToAdvanceSuccess,
  NewMeetingCheckInPayload,
  PromoteNewMeetingFacilitatorPayload,
  RemoveReflectionPayload,
  SetAppLocationSuccess,
  SetPhaseFocusPayload,
  SetStageTimerPayload,
  StartDraggingReflectionPayload,
  UpdateCommentContentSuccess,
  UpdateDragLocationPayload,
  UpdateNewCheckInQuestionPayload,
  UpdateReflectionContentPayload,
  UpdateReflectionGroupTitlePayload,
  UpdateRetroMaxVotesSuccess,
  VoteForReflectionGroupPayload
]

export default graphQLSubscriptionType('MeetingSubscriptionPayload', types)

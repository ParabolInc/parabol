import graphQLSubscriptionType from '../graphQLSubscriptionType'
import {AddReactjiToReflectionSuccess} from './AddReactjiToReflectionPayload'
import {AddReactjiToReactableSuccess} from './AddReactjiToReactablePayload'
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
import {AddCommentSuccess} from './AddCommentPayload'
import {DeleteCommentSuccess} from './DeleteCommentPayload'
import {UpdateCommentContentSuccess} from './UpdateCommentContentPayload'
import {UpdateRetroMaxVotesSuccess} from './UpdateRetroMaxVotesPayload'
import {FlagReadyToAdvanceSuccess} from './FlagReadyToAdvancePayload'
import EditCommentingPayload from './EditCommentingPayload'

const types = [
  AddCommentSuccess,
  AddReactjiToReflectionSuccess, // DEPRECATED
  AddReactjiToReactableSuccess,
  AutoGroupReflectionsPayload,
  CreateReflectionPayload,
  DeleteCommentSuccess,
  DragDiscussionTopicPayload,
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

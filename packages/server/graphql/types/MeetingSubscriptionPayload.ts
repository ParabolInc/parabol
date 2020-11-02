import graphQLSubscriptionType from '../graphQLSubscriptionType'
import {AddCommentSuccess} from './AddCommentPayload'
import {AddReactjiToReactableSuccess} from './AddReactjiToReactablePayload'
import {AddReactjiToReflectionSuccess} from './AddReactjiToReflectionPayload'
import AutoGroupReflectionsPayload from './AutoGroupReflectionsPayload'
import CreateReflectionPayload from './CreateReflectionPayload'
import {DeleteCommentSuccess} from './DeleteCommentPayload'
import DragDiscussionTopicPayload from './DragDiscussionTopicPayload'
import {DragEstimatingTaskSuccess} from './DragEstimatingTaskPayload'
import EditCommentingPayload from './EditCommentingPayload'
import EditReflectionPayload from './EditReflectionPayload'
import EndDraggingReflectionPayload from './EndDraggingReflectionPayload'
import {FlagReadyToAdvanceSuccess} from './FlagReadyToAdvancePayload'
import JiraCreateIssuePayload from './JiraCreateIssuePayload'
import NewMeetingCheckInPayload from './NewMeetingCheckInPayload'
import PromoteNewMeetingFacilitatorPayload from './PromoteNewMeetingFacilitatorPayload'
import RemoveReflectionPayload from './RemoveReflectionPayload'
import ResetMeetingToStagePayload from './ResetMeetingToStagePayload'
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
import VoteForReflectionGroupPayload from './VoteForReflectionGroupPayload'
import {VoteForPokerStorySuccess} from './VoteForPokerStoryPayload'
import {PokerRevealVotesSuccess} from './PokerRevealVotesPayload'
import {PokerResetDimensionSuccess} from './PokerResetDimensionPayload'
import {UpdatePokerScopeSuccess} from './UpdatePokerScopePayload'

const types = [
  // DEPRECATED
  AddCommentSuccess,
  AddReactjiToReflectionSuccess,
  AddReactjiToReactableSuccess,
  AutoGroupReflectionsPayload,
  CreateReflectionPayload,
  DeleteCommentSuccess,
  DragDiscussionTopicPayload,
  DragEstimatingTaskSuccess,
  EditCommentingPayload,
  EditReflectionPayload,
  EndDraggingReflectionPayload,
  FlagReadyToAdvanceSuccess,
  JiraCreateIssuePayload,
  NewMeetingCheckInPayload,
  PromoteNewMeetingFacilitatorPayload,
  RemoveReflectionPayload,
  ResetMeetingToStagePayload,
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
  UpdatePokerScopeSuccess,
  VoteForReflectionGroupPayload,
  VoteForPokerStorySuccess,
  PokerRevealVotesSuccess,
  PokerResetDimensionSuccess
]

export default graphQLSubscriptionType('MeetingSubscriptionPayload', types)

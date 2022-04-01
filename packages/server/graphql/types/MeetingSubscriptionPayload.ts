import graphQLSubscriptionType from '../graphQLSubscriptionType'
import {AddCommentSuccess} from './AddCommentPayload'
import {AddReactjiToReactableSuccess} from './AddReactjiToReactablePayload'
import {AddReactjiToReflectionSuccess} from './AddReactjiToReflectionPayload'
import AutoGroupReflectionsPayload from './AutoGroupReflectionsPayload'
import CreateReflectionPayload from './CreateReflectionPayload'
import {DeleteCommentSuccess} from './DeleteCommentPayload'
import DragDiscussionTopicPayload from './DragDiscussionTopicPayload'
import {DragEstimatingTaskSuccess} from './DragEstimatingTaskPayload'
import {EditCommentingSuccess} from './EditCommentingPayload'
import EditReflectionPayload from './EditReflectionPayload'
import EndDraggingReflectionPayload from './EndDraggingReflectionPayload'
import {FlagReadyToAdvanceSuccess} from './FlagReadyToAdvancePayload'
import {JoinMeetingSuccess} from './JoinMeetingPayload'
import NewMeetingCheckInPayload from './NewMeetingCheckInPayload'
import {PokerAnnounceDeckHoverSuccess} from './PokerAnnounceDeckHoverPayload'
import {PokerResetDimensionSuccess} from './PokerResetDimensionPayload'
import {PokerRevealVotesSuccess} from './PokerRevealVotesPayload'
import PromoteNewMeetingFacilitatorPayload from './PromoteNewMeetingFacilitatorPayload'
import RemoveReflectionPayload from './RemoveReflectionPayload'
import ResetRetroMeetingToGroupStagePayload from './ResetRetroMeetingToGroupStagePayload'
import SetPhaseFocusPayload from './SetPhaseFocusPayload'
import {SetPokerSpectateSuccess} from './SetPokerSpectatePayload'
import SetStageTimerPayload from './SetStageTimerPayload'
import StartDraggingReflectionPayload from './StartDraggingReflectionPayload'
import {UpdateCommentContentSuccess} from './UpdateCommentContentPayload'
import UpdateDragLocationPayload from './UpdateDragLocationPayload'
import UpdateNewCheckInQuestionPayload from './UpdateNewCheckInQuestionPayload'
import {UpdatePokerScopeSuccess} from './UpdatePokerScopePayload'
import UpdateReflectionContentPayload from './UpdateReflectionContentPayload'
import UpdateReflectionGroupTitlePayload from './UpdateReflectionGroupTitlePayload'
import {UpdateRetroMaxVotesSuccess} from './UpdateRetroMaxVotesPayload'
import {VoteForPokerStorySuccess} from './VoteForPokerStoryPayload'
import {SetTaskEstimateSuccess} from './SetTaskEstimatePayload'
import VoteForReflectionGroupPayload from './VoteForReflectionGroupPayload'
import {CreatePollSuccess} from './CreatePollPayload'
import {UpdatePromptResponseSuccess} from './UpdatePromptResponsePayload'
import {SetTaskHighlightSuccess} from './SetTaskHighlightPayload'

const types = [
  AddCommentSuccess,
  CreatePollSuccess,
  AddReactjiToReflectionSuccess,
  AddReactjiToReactableSuccess,
  AutoGroupReflectionsPayload,
  CreateReflectionPayload,
  DeleteCommentSuccess,
  DragDiscussionTopicPayload,
  DragEstimatingTaskSuccess,
  EditCommentingSuccess,
  EditReflectionPayload,
  EndDraggingReflectionPayload,
  FlagReadyToAdvanceSuccess,
  NewMeetingCheckInPayload,
  PromoteNewMeetingFacilitatorPayload,
  RemoveReflectionPayload,
  ResetRetroMeetingToGroupStagePayload,
  SetPhaseFocusPayload,
  SetStageTimerPayload,
  StartDraggingReflectionPayload,
  SetTaskHighlightSuccess,
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
  PokerResetDimensionSuccess,
  PokerAnnounceDeckHoverSuccess,
  JoinMeetingSuccess,
  SetPokerSpectateSuccess,
  SetTaskEstimateSuccess,
  UpdatePromptResponseSuccess
]

export default graphQLSubscriptionType('MeetingSubscriptionPayload', types)

import graphql from 'babel-plugin-relay/macro'
import {RouterProps} from 'react-router'
import {requestSubscription} from 'relay-runtime'
import {addCommentMeetingUpdater} from '~/mutations/AddCommentMutation'
import {createPollMeetingUpdater} from '~/mutations/CreatePollMutation'
import {deleteCommentMeetingUpdater} from '~/mutations/DeleteCommentMutation'
import {upsertTeamPromptResponseUpdater} from '~/mutations/UpsertTeamPromptResponseMutation'
import {
  MeetingSubscription as TMeetingSubscription,
  MeetingSubscriptionVariables
} from '~/__generated__/MeetingSubscription.graphql'
import Atmosphere from '../Atmosphere'
import {createReflectionMeetingUpdater} from '../mutations/CreateReflectionMutation'
import {dragDiscussionTopicMeetingUpdater} from '../mutations/DragDiscussionTopicMutation'
import {editReflectionMeetingUpdater} from '../mutations/EditReflectionMutation'
import {
  endDraggingReflectionMeetingOnNext,
  endDraggingReflectionMeetingUpdater
} from '../mutations/EndDraggingReflectionMutation'
import {pokerAnnounceDeckHoverMeetingUpdater} from '../mutations/PokerAnnounceDeckHoverMutation'
import {promoteNewMeetingFacilitatorMeetingOnNext} from '../mutations/PromoteNewMeetingFacilitatorMutation'
import {removeReflectionMeetingUpdater} from '../mutations/RemoveReflectionMutation'
import {resetRetroMeetingToGroupStageUpdater} from '../mutations/ResetRetroMeetingToGroupStageMutation'
import {setStageTimerMeetingUpdater} from '../mutations/SetStageTimerMutation'
import {startDraggingReflectionMeetingUpdater} from '../mutations/StartDraggingReflectionMutation'

const subscription = graphql`
  subscription MeetingSubscription($meetingId: ID!) {
    meetingSubscription(meetingId: $meetingId) {
      __typename
      UpdateMeetingPromptSuccess {
        ...UpdateMeetingPromptMutation_meeting @relay(mask: false)
      }
      SetTaskEstimateSuccess {
        ...SetTaskEstimateMutation_meeting @relay(mask: false)
      }
      SetPokerSpectateSuccess {
        ...SetPokerSpectateMutation_team @relay(mask: false)
      }
      JoinMeetingSuccess {
        ...JoinMeetingMutation_meeting @relay(mask: false)
      }
      PokerAnnounceDeckHoverSuccess {
        ...PokerAnnounceDeckHoverMutation_meeting @relay(mask: false)
      }
      PokerResetDimensionSuccess {
        ...PokerResetDimensionMutation_meeting @relay(mask: false)
      }
      PokerRevealVotesSuccess {
        ...PokerRevealVotesMutation_meeting @relay(mask: false)
      }
      VoteForPokerStorySuccess {
        ...VoteForPokerStoryMutation_meeting @relay(mask: false)
      }
      AddReactjiToReactableSuccess {
        ...AddReactjiToReactableMutation_meeting @relay(mask: false)
      }
      AddCommentSuccess {
        ...AddCommentMutation_meeting @relay(mask: false)
      }
      CreatePollSuccess {
        ...CreatePollMutation_meeting @relay(mask: false)
      }
      CreateReflectionPayload {
        ...CreateReflectionMutation_meeting @relay(mask: false)
      }
      DeleteCommentSuccess {
        ...DeleteCommentMutation_meeting @relay(mask: false)
      }
      DragDiscussionTopicPayload {
        ...DragDiscussionTopicMutation_meeting @relay(mask: false)
      }
      EditCommentingSuccess {
        ...EditCommentingMutation_meeting @relay(mask: false)
      }
      EditReflectionPayload {
        ...EditReflectionMutation_meeting @relay(mask: false)
      }
      EndDraggingReflectionPayload {
        ...EndDraggingReflectionMutation_meeting @relay(mask: false)
      }
      EndRetrospectiveSuccess {
        ...EndRetrospectiveMutation_meeting @relay(mask: false)
      }
      FlagReadyToAdvanceSuccess {
        ...FlagReadyToAdvanceMutation_meeting @relay(mask: false)
      }
      PromoteNewMeetingFacilitatorPayload {
        ...PromoteNewMeetingFacilitatorMutation_meeting @relay(mask: false)
      }
      RemoveReflectionPayload {
        ...RemoveReflectionMutation_meeting @relay(mask: false)
      }
      ResetRetroMeetingToGroupStagePayload {
        ...ResetRetroMeetingToGroupStageMutation_meeting @relay(mask: false)
      }
      SetPhaseFocusPayload {
        ...SetPhaseFocusMutation_meeting @relay(mask: false)
      }
      SetStageTimerPayload {
        ...SetStageTimerMutation_meeting @relay(mask: false)
      }
      StartDraggingReflectionPayload {
        ...StartDraggingReflectionMutation_meeting @relay(mask: false)
      }
      SetTaskHighlightSuccess {
        ...SetTaskHighlightMutation_meeting @relay(mask: false)
      }
      UpdateCommentContentSuccess {
        ...UpdateCommentContentMutation_meeting @relay(mask: false)
      }
      UpdateNewCheckInQuestionPayload {
        ...UpdateNewCheckInQuestionMutation_meeting @relay(mask: false)
      }
      UpdateDragLocationPayload {
        ...UpdateDragLocationMutation_meeting @relay(mask: false)
      }
      UpdatePokerScopeSuccess {
        ...UpdatePokerScopeMutation_meeting @relay(mask: false)
      }
      UpdateReflectionContentPayload {
        ...UpdateReflectionContentMutation_meeting @relay(mask: false)
      }
      UpdateReflectionGroupTitlePayload {
        ...UpdateReflectionGroupTitleMutation_meeting @relay(mask: false)
      }
      UpdateRetroMaxVotesSuccess {
        ...UpdateRetroMaxVotesMutation_meeting @relay(mask: false)
      }
      VoteForReflectionGroupPayload {
        ...VoteForReflectionGroupMutation_meeting @relay(mask: false)
      }
      UpsertTeamPromptResponseSuccess {
        ...UpsertTeamPromptResponseMutation_meeting @relay(mask: false)
      }
    }
  }
`

const onNextHandlers = {
  EndDraggingReflectionPayload: endDraggingReflectionMeetingOnNext,
  PromoteNewMeetingFacilitatorPayload: promoteNewMeetingFacilitatorMeetingOnNext
} as const

const updateHandlers = {
  CreatePollSuccess: createPollMeetingUpdater,
  AddCommentSuccess: addCommentMeetingUpdater,
  CreateReflectionPayload: createReflectionMeetingUpdater,
  DeleteCommentSuccess: deleteCommentMeetingUpdater,
  DragDiscussionTopicPayload: dragDiscussionTopicMeetingUpdater,
  EditReflectionPayload: editReflectionMeetingUpdater,
  EndDraggingReflectionPayload: endDraggingReflectionMeetingUpdater,
  RemoveReflectionPayload: removeReflectionMeetingUpdater,
  SetStageTimerPayload: setStageTimerMeetingUpdater,
  ResetRetroMeetingToGroupStagePayload: resetRetroMeetingToGroupStageUpdater,
  StartDraggingReflectionPayload: startDraggingReflectionMeetingUpdater,
  PokerAnnounceDeckHoverSuccess: pokerAnnounceDeckHoverMeetingUpdater,
  UpsertTeamPromptResponseSuccess: upsertTeamPromptResponseUpdater
} as const

const MeetingSubscription = (
  atmosphere: Atmosphere,
  variables: MeetingSubscriptionVariables,
  router: {history: RouterProps['history']}
) => {
  return requestSubscription<TMeetingSubscription>(atmosphere, {
    subscription,
    variables,
    updater: (store) => {
      const payload = store.getRootField('meetingSubscription') as any
      if (!payload) return
      const type = payload.getValue('__typename') as keyof typeof updateHandlers
      const handler = updateHandlers[type]
      if (handler) {
        handler(payload[type], {atmosphere, store})
      }
    },
    onNext: (result) => {
      if (!result) return
      const {meetingSubscription} = result
      const type = meetingSubscription.__typename as keyof typeof meetingSubscription
      const handler = onNextHandlers[type as keyof typeof onNextHandlers]
      if (handler) {
        handler(meetingSubscription[type] as any, {...router, atmosphere})
      }
    },
    onCompleted: () => {
      atmosphere.unregisterSub(MeetingSubscription.name, variables)
    }
  })
}
MeetingSubscription.key = 'meeting'
export default MeetingSubscription

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
      ...UpdateMeetingPromptMutation_meeting @relay(mask: false)
      ...SetTaskEstimateMutation_meeting @relay(mask: false)
      ...SetPokerSpectateMutation_team @relay(mask: false)
      ...JoinMeetingMutation_meeting @relay(mask: false)
      ...PokerAnnounceDeckHoverMutation_meeting @relay(mask: false)
      ...PokerResetDimensionMutation_meeting @relay(mask: false)
      ...PokerRevealVotesMutation_meeting @relay(mask: false)
      ...VoteForPokerStoryMutation_meeting @relay(mask: false)
      ...AddReactjiToReactableMutation_meeting @relay(mask: false)
      ...AddCommentMutation_meeting @relay(mask: false)
      ...CreatePollMutation_meeting @relay(mask: false)
      ...CreateReflectionMutation_meeting @relay(mask: false)
      ...DeleteCommentMutation_meeting @relay(mask: false)
      ...DragDiscussionTopicMutation_meeting @relay(mask: false)
      ...EditCommentingMutation_meeting @relay(mask: false)
      ...EditReflectionMutation_meeting @relay(mask: false)
      ...EndDraggingReflectionMutation_meeting @relay(mask: false)
      ...FlagReadyToAdvanceMutation_meeting @relay(mask: false)
      ...PromoteNewMeetingFacilitatorMutation_meeting @relay(mask: false)
      ...RemoveReflectionMutation_meeting @relay(mask: false)
      ...ResetRetroMeetingToGroupStageMutation_meeting @relay(mask: false)
      ...SetPhaseFocusMutation_meeting @relay(mask: false)
      ...SetStageTimerMutation_meeting @relay(mask: false)
      ...StartDraggingReflectionMutation_meeting @relay(mask: false)
      ...SetTaskHighlightMutation_meeting @relay(mask: false)
      ...UpdateCommentContentMutation_meeting @relay(mask: false)
      ...UpdateNewCheckInQuestionMutation_meeting @relay(mask: false)
      ...UpdateDragLocationMutation_meeting @relay(mask: false)
      ...UpdatePokerScopeMutation_meeting @relay(mask: false)
      ...UpdateReflectionContentMutation_meeting @relay(mask: false)
      ...UpdateReflectionGroupTitleMutation_meeting @relay(mask: false)
      ...UpdateRetroMaxVotesMutation_meeting @relay(mask: false)
      ...VoteForReflectionGroupMutation_meeting @relay(mask: false)
      ...UpsertTeamPromptResponseMutation_meeting @relay(mask: false)
    }
  }
`

const onNextHandlers = {
  EndDraggingReflectionPayload: endDraggingReflectionMeetingOnNext,
  PromoteNewMeetingFacilitatorPayload: promoteNewMeetingFacilitatorMeetingOnNext
}

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
}

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
      const type = payload.getValue('__typename') as string
      const handler = updateHandlers[type]
      if (handler) {
        handler(payload, {atmosphere, store})
      }
    },
    onNext: (result) => {
      if (!result) return
      const {meetingSubscription} = result
      const {__typename: type} = meetingSubscription
      const handler = onNextHandlers[type]
      if (handler) {
        handler(meetingSubscription, {...router, atmosphere})
      }
    },
    onCompleted: () => {
      atmosphere.unregisterSub(MeetingSubscription.name, variables)
    }
  })
}
MeetingSubscription.key = 'meeting'
export default MeetingSubscription

import graphql from 'babel-plugin-relay/macro'
import Atmosphere from '../Atmosphere'
import {requestSubscription, Variables} from 'relay-runtime'
import {RouterProps} from 'react-router'
import {createReflectionTeamUpdater} from '../mutations/CreateReflectionMutation'
import {dragDiscussionTopicTeamUpdater} from '../mutations/DragDiscussionTopicMutation'
import {editReflectionTeamUpdater} from '../mutations/EditReflectionMutation'
import {
  endDraggingReflectionTeamOnNext,
  endDraggingReflectionTeamUpdater
} from '../mutations/EndDraggingReflectionMutation'
import {navigateMeetingTeamUpdater} from '../mutations/NavigateMeetingMutation'
import {promoteNewMeetingFacilitatorTeamOnNext} from '../mutations/PromoteNewMeetingFacilitatorMutation'
import {removeReflectionTeamUpdater} from '../mutations/RemoveReflectionMutation'
import {setStageTimerTeamUpdater} from '../mutations/SetStageTimerMutation'
import {startDraggingReflectionTeamUpdater} from '../mutations/StartDraggingReflectionMutation'
import {MeetingSubscriptionResponse} from '__generated__/MeetingSubscription.graphql'

const subscription = graphql`
  subscription MeetingSubscription($meetingId: ID!) {
    meetingSubscription(meetingId: $meetingId) {
      __typename
      ...CreateReflectionMutation_meeting @relay(mask: false)
      ...DragDiscussionTopicMutation_meeting @relay(mask: false)
      ...EditReflectionMutation_meeting @relay(mask: false)
      ...EndDraggingReflectionMutation_meeting @relay(mask: false)
      ...NavigateMeetingMutation_meeting @relay(mask: false)
      ...NewMeetingCheckInMutation_meeting @relay(mask: false)
      ...PromoteNewMeetingFacilitatorMutation_meeting @relay(mask: false)
      ...RemoveReflectionMutation_meeting @relay(mask: false)
      ...SetPhaseFocusMutation_meeting @relay(mask: false)
      ...SetStageTimerMutation_meeting @relay(mask: false)
      ...StartDraggingReflectionMutation_meeting @relay(mask: false)
      ...UpdateNewCheckInQuestionMutation_meeting @relay(mask: false)
      ...UpdateDragLocationMutation_meeting @relay(mask: false)
      ...UpdateReflectionContentMutation_meeting @relay(mask: false)
      ...UpdateReflectionGroupTitleMutation_meeting @relay(mask: false)
      ...VoteForReflectionGroupMutation_meeting @relay(mask: false)
    }
  }
`

const onNextHandlers = {
  EndDraggingReflectionPayload: endDraggingReflectionTeamOnNext,
  PromoteNewMeetingFacilitatorPayload: promoteNewMeetingFacilitatorTeamOnNext
}

const updateHandlers = {
  CreateReflectionPayload: createReflectionTeamUpdater,
  DragDiscussionTopicPayload: dragDiscussionTopicTeamUpdater,
  EditReflectionPayload: editReflectionTeamUpdater,
  EndDraggingReflectionPayload: endDraggingReflectionTeamUpdater,
  NavigateMeetingPayload: navigateMeetingTeamUpdater,
  RemoveReflectionPayload: removeReflectionTeamUpdater,
  SetStageTimerPayload: setStageTimerTeamUpdater,
  StartDraggingReflectionPayload: startDraggingReflectionTeamUpdater
}

const MeetingSubscription = (
  atmosphere: Atmosphere,
  variables: Variables,
  router: {history: RouterProps['history']}
) => {
  console.log('vars', variables)
  const {viewerId} = atmosphere
  return requestSubscription<MeetingSubscriptionResponse>(atmosphere, {
    subscription,
    variables,
    updater: (store) => {
      const payload = store.getRootField('meetingSubscription') as any
      if (!payload) return
      const type = payload.getValue('__typename') as string
      const handler = updateHandlers[type]
      if (handler) {
        handler(payload, store, viewerId)
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

export default MeetingSubscription

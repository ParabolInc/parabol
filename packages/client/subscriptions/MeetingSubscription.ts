import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate} from 'relay-runtime'
import {
  type MeetingSubscription,
  MeetingSubscription$variables
} from '~/__generated__/MeetingSubscription.graphql'
import {addCommentMeetingUpdater} from '~/mutations/AddCommentMutation'
import {createPollMeetingUpdater} from '~/mutations/CreatePollMutation'
import {deleteCommentMeetingUpdater} from '~/mutations/DeleteCommentMutation'
import {shareTeamPromptResponsesMeetingUpdater} from '~/mutations/useShareTeamPromptResponsesMutation'
import {upsertTeamPromptResponseMeetingUpdater} from '~/mutations/useUpsertTeamPromptResponseMutation'
import Atmosphere from '../Atmosphere'
import {createReflectionMeetingUpdater} from '../mutations/CreateReflectionMutation'
import {dragDiscussionTopicMeetingUpdater} from '../mutations/DragDiscussionTopicMutation'
import {editReflectionMeetingUpdater} from '../mutations/EditReflectionMutation'
import {
  endDraggingReflectionMeetingOnNext,
  endDraggingReflectionMeetingUpdater
} from '../mutations/EndDraggingReflectionMutation'
import {joinMeetingMeetingUpdater} from '../mutations/JoinMeetingMutation'
import {pokerAnnounceDeckHoverMeetingUpdater} from '../mutations/PokerAnnounceDeckHoverMutation'
import {removeReflectionMeetingUpdater} from '../mutations/RemoveReflectionMutation'
import {resetRetroMeetingToGroupStageUpdater} from '../mutations/ResetRetroMeetingToGroupStageMutation'
import {setMeetingMusicMeetingUpdater} from '../mutations/SetMeetingMusicMutation'
import {setStageTimerMeetingUpdater} from '../mutations/SetStageTimerMutation'
import {startDraggingReflectionMeetingUpdater} from '../mutations/StartDraggingReflectionMutation'
import {acceptSuggestedGroupsMeetingOnNext} from '../mutations/useAcceptSuggestedGroupsMutation'
import {suggestedGroupsMeetingUpdater} from '../mutations/useGenerateSuggestedGroupsMutation'
import {updateFacilitatorRotationMeetingOnNext} from '../mutations/useUpdateFacilitatorRotationMutation'
import {createSubscription} from './createSubscription'

const subscription = graphql`
  subscription MeetingSubscription($meetingId: ID!) {
    meetingSubscription(meetingId: $meetingId) {
      fieldName
      AddTranscriptionBotPayload {
        ...AddTranscriptionBotMutation_meeting
      }
      AutogroupPayload {
        ...AutogroupMutation_meeting @relay(mask: false)
      }
      ResetReflectionGroupsPayload {
        ...ResetReflectionGroupsMutation_meeting @relay(mask: false)
      }
      AcceptSuggestedGroupsPayload {
        ...useAcceptSuggestedGroupsMutation_meeting @relay(mask: false)
      }
      UngroupReflectionPayload {
        ...UngroupReflectionMutation_meeting @relay(mask: false)
      }
      SuggestedGroupsPayload {
        ...useGenerateSuggestedGroupsMutation_meeting @relay(mask: false)
      }
      SetTaskEstimatePayload {
        ...SetTaskEstimateMutation_meeting @relay(mask: false)
      }
      SetPokerSpectatePayload {
        ...SetPokerSpectateMutation_team @relay(mask: false)
      }
      JoinMeetingPayload {
        ...JoinMeetingMutation_meeting @relay(mask: false)
      }
      PokerAnnounceDeckHoverPayload {
        ...PokerAnnounceDeckHoverMutation_meeting @relay(mask: false)
      }
      PokerResetDimensionPayload {
        ...PokerResetDimensionMutation_meeting @relay(mask: false)
      }
      PokerRevealVotesPayload {
        ...PokerRevealVotesMutation_meeting @relay(mask: false)
      }
      VoteForPokerStoryPayload {
        ...VoteForPokerStoryMutation_meeting @relay(mask: false)
      }
      AddReactjiToReactablePayload {
        ...AddReactjiToReactableMutation_meeting @relay(mask: false)
      }
      AddCommentPayload {
        ...AddCommentMutation_meeting @relay(mask: false)
      }
      CreatePollPayload {
        ...CreatePollMutation_meeting @relay(mask: false)
      }
      CreateReflectionPayload {
        ...CreateReflectionMutation_meeting @relay(mask: false)
      }
      DeleteCommentPayload {
        ...DeleteCommentMutation_meeting @relay(mask: false)
      }
      DragDiscussionTopicPayload {
        ...DragDiscussionTopicMutation_meeting @relay(mask: false)
      }
      EditCommentingPayload {
        ...EditCommentingMutation_meeting @relay(mask: false)
      }
      EditReflectionPayload {
        ...EditReflectionMutation_meeting @relay(mask: false)
      }
      EndDraggingReflectionPayload {
        ...EndDraggingReflectionMutation_meeting @relay(mask: false)
      }
      EndRetrospectivePayload {
        ...EndRetrospectiveMutation_meeting @relay(mask: false)
      }
      EndTeamPromptPayload {
        ...EndTeamPromptMutation_meeting @relay(mask: false)
      }
      EndTeamHealthPayload {
        ...useEndTeamHealthMutation_meeting @relay(mask: false)
      }
      FlagReadyToAdvancePayload {
        ...FlagReadyToAdvanceMutation_meeting @relay(mask: false)
      }
      UpdateFacilitatorRotationPayload {
        ...useUpdateFacilitatorRotationMutation_meeting @relay(mask: false)
      }
      RemoveReflectionPayload {
        ...RemoveReflectionMutation_meeting @relay(mask: false)
      }
      ResetRetroMeetingToGroupStagePayload {
        ...ResetRetroMeetingToGroupStageMutation_meeting @relay(mask: false)
      }
      RevealTeamHealthVotesPayload {
        ...RevealTeamHealthVotesMutation_meeting @relay(mask: false)
      }
      RetroTeamHealthCheckPayload {
        meeting {
          id
          # the retro may now show a check, so everything it reads of one comes with it
          ...RetroTeamHealthPhase_meeting
          ...RetroMeetingSidebar_meeting
          teamHealthMeeting {
            viewerMeetingMember {
              id
            }
            ...getTeamHealthDiscussionId_meeting
            ...useTeamHealthCheckInRetro_meeting
          }
        }
      }
      SetPhaseFocusPayload {
        ...SetPhaseFocusMutation_meeting @relay(mask: false)
      }
      SetStageTimerPayload {
        ...SetStageTimerMutation_meeting @relay(mask: false)
      }
      SetTeamHealthVotePayload {
        ...SetTeamHealthVoteMutation_meeting @relay(mask: false)
      }
      DragEstimatingTaskPayload {
        ...DragEstimatingTaskMutation_meeting @relay(mask: false)
      }
      DragTeamHealthResultStagePayload {
        ...useDragTeamHealthResultStageMutation_meeting @relay(mask: false)
      }
      SetTeamHealthResponsePayload {
        ...useSetTeamHealthResponseMutation_meeting @relay(mask: false)
      }
      SetTeamHealthSpectatePayload {
        ...useSetTeamHealthSpectateMutation_meeting @relay(mask: false)
      }
      StartDraggingReflectionPayload {
        ...StartDraggingReflectionMutation_meeting @relay(mask: false)
      }
      TeamHealthCategorySummaryPayload {
        stage {
          id
          ...TeamHealthResultCard_stage
        }
      }
      SetMeetingMusicPayload {
        ...SetMeetingMusicMutation_meeting @relay(mask: false)
      }
      SetTaskHighlightPayload {
        ...SetTaskHighlightMutation_meeting @relay(mask: false)
      }
      UpdateCommentContentPayload {
        ...UpdateCommentContentMutation_meeting @relay(mask: false)
      }
      UpdateNewCheckInQuestionPayload {
        ...UpdateNewCheckInQuestionMutation_meeting @relay(mask: false)
      }
      UpdateDragLocationPayload {
        ...UpdateDragLocationMutation_meeting @relay(mask: false)
      }
      UpdatePokerScopePayload {
        ...useUpdatePokerScopeMutation_meeting @relay(mask: false)
      }
      UpdateReflectionContentPayload {
        ...UpdateReflectionContentMutation_meeting @relay(mask: false)
      }
      UpdateReflectionGroupTitlePayload {
        ...UpdateReflectionGroupTitleMutation_meeting @relay(mask: false)
      }
      UpdateRetroMaxVotesPayload {
        ...UpdateRetroMaxVotesMutation_meeting @relay(mask: false)
      }
      UpdateMeetingTemplatePayload {
        ...useUpdateMeetingTemplateMutation_meeting @relay(mask: false)
      }
      SetMeetingSettingsPayload {
        ...useSetMeetingSettingsMutation_payload @relay(mask: false)
      }
      VoteForReflectionGroupPayload {
        ...VoteForReflectionGroupMutation_meeting @relay(mask: false)
      }
      UpsertTeamPromptResponsePayload {
        ...useUpsertTeamPromptResponseMutation_meeting @relay(mask: false)
      }
      ShareTeamPromptResponsesPayload {
        ...useShareTeamPromptResponsesMutation_meeting @relay(mask: false)
      }
    }
  }
`

const onNextHandlers = {
  AcceptSuggestedGroupsPayload: acceptSuggestedGroupsMeetingOnNext,
  EndDraggingReflectionPayload: endDraggingReflectionMeetingOnNext,
  UpdateFacilitatorRotationPayload: updateFacilitatorRotationMeetingOnNext
} as const

const updateHandlers = {
  CreatePollPayload: createPollMeetingUpdater,
  AddCommentPayload: addCommentMeetingUpdater,
  CreateReflectionPayload: createReflectionMeetingUpdater,
  DeleteCommentPayload: deleteCommentMeetingUpdater,
  DragDiscussionTopicPayload: dragDiscussionTopicMeetingUpdater,
  EditReflectionPayload: editReflectionMeetingUpdater,
  EndDraggingReflectionPayload: endDraggingReflectionMeetingUpdater,
  JoinMeetingPayload: joinMeetingMeetingUpdater,
  RemoveReflectionPayload: removeReflectionMeetingUpdater,
  SetStageTimerPayload: setStageTimerMeetingUpdater,
  ResetRetroMeetingToGroupStagePayload: resetRetroMeetingToGroupStageUpdater,
  StartDraggingReflectionPayload: startDraggingReflectionMeetingUpdater,
  PokerAnnounceDeckHoverPayload: pokerAnnounceDeckHoverMeetingUpdater,
  UpsertTeamPromptResponsePayload: upsertTeamPromptResponseMeetingUpdater,
  ShareTeamPromptResponsesPayload: shareTeamPromptResponsesMeetingUpdater,
  SetMeetingMusicPayload: setMeetingMusicMeetingUpdater,
  SuggestedGroupsPayload: suggestedGroupsMeetingUpdater
} as const

const invalidator = (environment: Atmosphere, variables: MeetingSubscription$variables) => {
  commitLocalUpdate(environment, (store) => {
    const meeting = store.get(variables.meetingId)
    meeting?.invalidateRecord()
  })
}

export default createSubscription<MeetingSubscription>(
  subscription,
  onNextHandlers,
  updateHandlers,
  invalidator
)

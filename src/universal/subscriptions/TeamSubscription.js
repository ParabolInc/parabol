import {acceptTeamInviteTeamUpdater} from 'universal/mutations/AcceptTeamInviteMutation'
import {addOrgMutationNotificationUpdater} from 'universal/mutations/AddOrgMutation'
import {
  addTeamMutationNotificationUpdater,
  addTeamTeamUpdater
} from 'universal/mutations/AddTeamMutation'
import {archiveTeamTeamUpdater} from 'universal/mutations/ArchiveTeamMutation'
import {createReflectionTeamUpdater} from 'universal/mutations/CreateReflectionMutation'
import {endMeetingTeamUpdater} from 'universal/mutations/EndMeetingMutation'
import {inviteTeamMembersTeamUpdater} from 'universal/mutations/InviteTeamMembersMutation'
import {killMeetingTeamUpdater} from 'universal/mutations/KillMeetingMutation'
import {promoteFacilitatorTeamUpdater} from 'universal/mutations/PromoteFacilitatorMutation'
import {removeReflectionTeamUpdater} from 'universal/mutations/RemoveReflectionMutation'
import {removeTeamMemberTeamUpdater} from 'universal/mutations/RemoveTeamMemberMutation'
import {requestFacilitatorTeamUpdater} from 'universal/mutations/RequestFacilitatorMutation'
import {
  removeOrgUserTeamOnNext,
  removeOrgUserTeamUpdater
} from 'universal/mutations/RemoveOrgUserMutation'
import {startNewMeetingTeamOnNext} from 'universal/mutations/StartNewMeetingMutation'
import {navigateMeetingTeamUpdater} from 'universal/mutations/NavigateMeetingMutation'
import {promoteNewMeetingFacilitatorTeamOnNext} from 'universal/mutations/PromoteNewMeetingFacilitatorMutation'
import {editReflectionTeamUpdater} from 'universal/mutations/EditReflectionMutation'
import {endNewMeetingTeamOnNext} from 'universal/mutations/EndNewMeetingMutation'
import {updateDragLocationTeamUpdater} from 'universal/mutations/UpdateDragLocationMutation'
import {
  endDraggingReflectionTeamOnNext,
  endDraggingReflectionTeamUpdater
} from 'universal/mutations/EndDraggingReflectionMutation'
import {dragDiscussionTopicTeamUpdater} from 'universal/mutations/DragDiscussionTopicMutation'
import {startDraggingReflectionTeamUpdater} from 'universal/mutations/StartDraggingReflectionMutation'
import {
  autoGroupReflectionsTeamOnNext,
  autoGroupReflectionsTeamUpdater
} from 'universal/mutations/AutoGroupReflectionsMutation'

const subscription = graphql`
  subscription TeamSubscription {
    teamSubscription {
      __typename
      ...AcceptTeamInviteMutation_team @relay(mask: false)
      ...AddTeamMutation_team @relay(mask: false)
      ...AddTeamMutation_team @relay(mask: false)
      ...ArchiveTeamMutation_team @relay(mask: false)
      ...AutoGroupReflectionsMutation_team @relay(mask: false)
      ...CreateReflectionMutation_team @relay(mask: false)
      ...DragDiscussionTopicMutation_team @relay(mask: false)
      ...EditReflectionMutation_team @relay(mask: false)
      ...EndDraggingReflectionMutation_team @relay(mask: false)
      ...EndMeetingMutation_team @relay(mask: false)
      ...KillMeetingMutation_team @relay(mask: false)
      ...EndNewMeetingMutation_team @relay(mask: false)
      ...MoveMeetingMutation_team @relay(mask: false)
      ...NavigateMeetingMutation_team @relay(mask: false)
      ...NewMeetingCheckInMutation_team @relay(mask: false)
      ...PromoteFacilitatorMutation_team @relay(mask: false)
      ...PromoteNewMeetingFacilitatorMutation_team @relay(mask: false)
      ...RemoveReflectionMutation_team @relay(mask: false)
      ...RemoveTeamMemberMutation_team @relay(mask: false)
      ...RemoveOrgUserMutation_team @relay(mask: false)
      ...RequestFacilitatorMutation_team @relay(mask: false)
      ...StartDraggingReflectionMutation_team @relay(mask: false)
      ...StartMeetingMutation_team @relay(mask: false)
      ...StartNewMeetingMutation_team @relay(mask: false)
      ...UpdateCheckInQuestionMutation_team @relay(mask: false)
      ...UpdateCreditCardMutation_team @relay(mask: false)
      ...UpdateDragLocationMutation_team @relay(mask: false)
      ...UpdateReflectionContentMutation_team @relay(mask: false)
      ...UpdateReflectionGroupTitleMutation_team @relay(mask: false)
      ...UpdateTeamNameMutation_team @relay(mask: false)
      ...UpgradeToProMutation_team @relay(mask: false)
      ...VoteForReflectionGroupMutation_team @relay(mask: false)
    }
  }
`

const onNextHandlers = {
  AutoGroupReflectionsPayload: autoGroupReflectionsTeamOnNext,
  EndNewMeetingPayload: endNewMeetingTeamOnNext,
  StartNewMeetingPayload: startNewMeetingTeamOnNext,
  PromoteNewMeetingFacilitatorPayload: promoteNewMeetingFacilitatorTeamOnNext,
  RemoveOrgUserPayload: removeOrgUserTeamOnNext,
  EndDraggingReflectionPayload: endDraggingReflectionTeamOnNext
}

const TeamSubscription = (environment, queryVariables, subParams) => {
  const {dispatch, history, location} = subParams
  const {viewerId} = environment
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('teamSubscription')
      if (!payload) return
      const type = payload.getValue('__typename')
      const options = {store, environment, dispatch, history, location}
      switch (type) {
        case 'AcceptTeamInvitePayload':
          acceptTeamInviteTeamUpdater(payload, store, viewerId)
          break
        case 'AddOrgCreatorPayload':
          addOrgMutationNotificationUpdater(payload, store, viewerId, options)
          break
        case 'AddTeamCreatorPayload':
          addTeamMutationNotificationUpdater(payload, store, viewerId, options)
          break
        case 'AutoGroupReflectionsPayload':
          autoGroupReflectionsTeamUpdater(payload, {atmosphere: environment, store})
          break
        case 'CreateGitHubIssuePayload':
          break
        case 'CreateReflectionPayload':
          createReflectionTeamUpdater(payload, store)
          break
        case 'EndDraggingReflectionPayload':
          endDraggingReflectionTeamUpdater(payload, {atmosphere: environment, store})
          break
        case 'DragDiscussionTopicPayload':
          dragDiscussionTopicTeamUpdater(payload, {store})
          break
        case 'RemoveTeamMemberSelfPayload':
          removeTeamMemberTeamUpdater(payload, store, viewerId, options)
          break
        case 'RequestFacilitatorPayload':
          requestFacilitatorTeamUpdater(payload, options)
          break
        case 'AddTeamMutationPayload':
          addTeamTeamUpdater(payload, store, viewerId)
          break
        case 'ArchiveTeamPayload':
          archiveTeamTeamUpdater(payload, store, viewerId, options)
          break
        case 'EditReflectionPayload':
          editReflectionTeamUpdater(payload, store)
          break
        case 'EndMeetingPayload':
          endMeetingTeamUpdater(payload, options)
          break
        case 'EndNewMeetingPayload':
          break
        case 'InviteTeamMembersPayload':
          inviteTeamMembersTeamUpdater(payload, store, viewerId)
          break
        case 'KillMeetingPayload':
          killMeetingTeamUpdater()
          break
        case 'MeetingCheckInPayload':
          break
        case 'MoveMeetingPayload':
          break
        case 'NavigateMeetingPayload':
          navigateMeetingTeamUpdater(payload, store, viewerId)
          break
        case 'NewMeetingCheckInPayload':
          break
        case 'PromoteFacilitatorPayload':
          promoteFacilitatorTeamUpdater(payload, viewerId, dispatch)
          break
        case 'PromoteNewMeetingFacilitatorPayload':
          break
        case 'RemoveOrgUserPayload':
          removeOrgUserTeamUpdater(payload, store, viewerId)
          break
        case 'RemoveReflectionPayload':
          removeReflectionTeamUpdater(payload, store)
          break
        case 'RemoveTeamMemberPayload':
          removeTeamMemberTeamUpdater(payload, store, viewerId, options)
          break
        case 'RequestFaciltatorPayload':
          requestFacilitatorTeamUpdater(payload, options)
          break
        case 'StartDraggingReflectionPayload':
          startDraggingReflectionTeamUpdater(payload, {atmosphere: environment, dispatch, store})
          break
        case 'StartMeetingPayload':
          break
        case 'StartNewMeetingPayload':
          break
        case 'UpdateCreditCardPayload':
          break
        case 'UpdateCheckInQuestionPayload':
          break
        case 'UpdateDragLocationPayload':
          updateDragLocationTeamUpdater(payload, {atmosphere: environment, store})
          break
        case 'UpdateReflectionContentPayload':
          break
        case 'UpdateReflectionGroupTitlePayload':
          break
        case 'UpgradeToProPayload':
          break
        case 'VoteForReflectionGroupPayload':
          break
        default:
          console.error('TeamSubscription case fail', type)
      }
    },
    onNext: ({teamSubscription}) => {
      const {__typename: type} = teamSubscription
      const handler = onNextHandlers[type]
      if (handler) {
        handler(teamSubscription, {...subParams, atmosphere: environment})
      }
    }
  }
}

export default TeamSubscription

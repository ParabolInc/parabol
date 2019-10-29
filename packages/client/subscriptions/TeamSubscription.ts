import {addTeamTeamUpdater} from '../mutations/AddTeamMutation'
import {archiveTeamTeamOnNext, archiveTeamTeamUpdater} from '../mutations/ArchiveTeamMutation'
import {createReflectionTeamUpdater} from '../mutations/CreateReflectionMutation'
import {removeReflectionTeamUpdater} from '../mutations/RemoveReflectionMutation'
import {
  removeTeamMemberTeamOnNext,
  removeTeamMemberTeamUpdater
} from '../mutations/RemoveTeamMemberMutation'
import {removeOrgUserTeamOnNext, removeOrgUserTeamUpdater} from '../mutations/RemoveOrgUserMutation'
import {startNewMeetingTeamOnNext} from '../mutations/StartNewMeetingMutation'
import {navigateMeetingTeamUpdater} from '../mutations/NavigateMeetingMutation'
import {promoteNewMeetingFacilitatorTeamOnNext} from '../mutations/PromoteNewMeetingFacilitatorMutation'
import {editReflectionTeamUpdater} from '../mutations/EditReflectionMutation'
import {endNewMeetingTeamOnNext, endNewMeetingTeamUpdater} from '../mutations/EndNewMeetingMutation'
import {
  endDraggingReflectionTeamOnNext,
  endDraggingReflectionTeamUpdater
} from '../mutations/EndDraggingReflectionMutation'
import {dragDiscussionTopicTeamUpdater} from '../mutations/DragDiscussionTopicMutation'
import {startDraggingReflectionTeamUpdater} from '../mutations/StartDraggingReflectionMutation'
import {addReflectTemplateTeamUpdater} from '../mutations/AddReflectTemplateMutation'
import {removeReflectTemplateTeamUpdater} from '../mutations/RemoveReflectTemplateMutation'
import {addReflectTemplatePromptTeamUpdater} from '../mutations/AddReflectTemplatePromptMutation'
import {removeReflectTemplatePromptTeamUpdater} from '../mutations/RemoveReflectTemplatePromptMutation'
import {moveReflectTemplatePromptTeamUpdater} from '../mutations/MoveReflectTemplatePromptMutation'
import {
  acceptTeamInvitationTeamOnNext,
  acceptTeamInvitationTeamUpdater
} from '../mutations/AcceptTeamInvitationMutation'
import {addAgendaItemUpdater} from '../mutations/AddAgendaItemMutation'
import {removeAgendaItemUpdater} from '../mutations/RemoveAgendaItemMutation'
import {updateAgendaItemUpdater} from '../mutations/UpdateAgendaItemMutation'
import graphql from 'babel-plugin-relay/macro'
import {pushInvitationTeamOnNext} from '../mutations/PushInvitationMutation'
import {denyPushInvitationTeamOnNext} from '../mutations/DenyPushInvitationMutation'
import Atmosphere from '../Atmosphere'
import {requestSubscription, Variables} from 'relay-runtime'
import {TeamSubscriptionResponse} from '../__generated__/TeamSubscription.graphql'

const subscription = graphql`
  subscription TeamSubscription {
    teamSubscription {
      __typename
      ...AcceptTeamInvitationMutation_team @relay(mask: false)
      ...AddReflectTemplateMutation_team @relay(mask: false)
      ...AddReflectTemplatePromptMutation_team @relay(mask: false)
      ...AddTeamMutation_team @relay(mask: false)
      ...ArchiveTeamMutation_team @relay(mask: false)
      ...CreateReflectionMutation_team @relay(mask: false)
      ...DenyPushInvitationMutation_team @relay(mask: false)
      ...DragDiscussionTopicMutation_team @relay(mask: false)
      ...EditReflectionMutation_team @relay(mask: false)
      ...EndDraggingReflectionMutation_team @relay(mask: false)
      ...EndNewMeetingMutation_team @relay(mask: false)
      ...MoveReflectTemplatePromptMutation_team @relay(mask: false)
      ...NavigateMeetingMutation_team @relay(mask: false)
      ...NewMeetingCheckInMutation_team @relay(mask: false)
      ...PromoteNewMeetingFacilitatorMutation_team @relay(mask: false)
      ...PromoteToTeamLeadMutation_team @relay(mask: false)
      ...PushInvitationMutation_team @relay(mask: false)
      ...RemoveReflectionMutation_team @relay(mask: false)
      ...RemoveReflectTemplateMutation_team @relay(mask: false)
      ...RemoveReflectTemplatePromptMutation_team @relay(mask: false)
      ...RemoveTeamMemberMutation_team @relay(mask: false)
      ...RemoveOrgUserMutation_team @relay(mask: false)
      ...RenameReflectTemplateMutation_team @relay(mask: false)
      ...RenameReflectTemplatePromptMutation_team @relay(mask: false)
      ...SelectRetroTemplateMutation_team @relay(mask: false)
      ...SetPhaseFocusMutation_team @relay(mask: false)
      ...SetStageTimerMutation_team @relay(mask: false)
      ...StartDraggingReflectionMutation_team @relay(mask: false)
      ...StartNewMeetingMutation_team @relay(mask: false)
      ...UpdateNewCheckInQuestionMutation_team @relay(mask: false)
      ...UpdateCreditCardMutation_team @relay(mask: false)
      ...UpdateDragLocationMutation_team @relay(mask: false)
      ...UpdateReflectionContentMutation_team @relay(mask: false)
      ...UpdateReflectionGroupTitleMutation_team @relay(mask: false)
      ...UpdateUserProfileMutation_team @relay(mask: false)
      ...UpdateTeamNameMutation_team @relay(mask: false)
      ...UpgradeToProMutation_team @relay(mask: false)
      ...VoteForReflectionGroupMutation_team @relay(mask: false)
      ...AddAgendaItemMutation_team @relay(mask: false)
      ...RemoveAgendaItemMutation_team @relay(mask: false)
      ...UpdateAgendaItemMutation_team @relay(mask: false)
    }
  }
`

const onNextHandlers = {
  AcceptTeamInvitationPayload: acceptTeamInvitationTeamOnNext,
  ArchiveTeamPayload: archiveTeamTeamOnNext,
  DenyPushInvitationPayload: denyPushInvitationTeamOnNext,
  EndNewMeetingPayload: endNewMeetingTeamOnNext,
  StartNewMeetingPayload: startNewMeetingTeamOnNext,
  PromoteNewMeetingFacilitatorPayload: promoteNewMeetingFacilitatorTeamOnNext,
  RemoveOrgUserPayload: removeOrgUserTeamOnNext,
  EndDraggingReflectionPayload: endDraggingReflectionTeamOnNext,
  RemoveTeamMemberPayload: removeTeamMemberTeamOnNext,
  PushInvitationPayload: pushInvitationTeamOnNext
}

const TeamSubscription = (
  atmosphere: Atmosphere,
  variables: Variables,
  router: {history: History}
) => {
  const {viewerId} = atmosphere
  return requestSubscription<TeamSubscriptionResponse>(atmosphere, {
    subscription,
    variables,
    updater: (store) => {
      const payload = store.getRootField('teamSubscription')
      if (!payload) return
      const type = payload.getValue('__typename')
      const context = {atmosphere, store}
      switch (type) {
        case 'AddAgendaItemPayload':
          addAgendaItemUpdater(payload, context)
          break
        case 'RemoveAgendaItemPayload':
          removeAgendaItemUpdater(payload, context)
          break
        case 'UpdateAgendaItemPayload':
          updateAgendaItemUpdater(payload, context)
          break
        case 'AcceptTeamInvitationPayload':
          acceptTeamInvitationTeamUpdater(payload, context)
          break
        case 'AddReflectTemplatePayload':
          addReflectTemplateTeamUpdater(payload, context)
          break
        case 'AddReflectTemplatePromptPayload':
          addReflectTemplatePromptTeamUpdater(payload, context)
          break
        case 'CreateGitHubIssuePayload':
          break
        case 'CreateReflectionPayload':
          createReflectionTeamUpdater(payload, store)
          break
        case 'EndDraggingReflectionPayload':
          endDraggingReflectionTeamUpdater(payload, context)
          break
        case 'DragDiscussionTopicPayload':
          dragDiscussionTopicTeamUpdater(payload, context)
          break
        case 'AddTeamMutationPayload':
          addTeamTeamUpdater(payload, store)
          break
        case 'ArchiveTeamPayload':
          archiveTeamTeamUpdater(payload, store, viewerId)
          break
        case 'EditReflectionPayload':
          editReflectionTeamUpdater(payload, store)
          break
        case 'EndNewMeetingPayload':
          endNewMeetingTeamUpdater(payload, context)
          break
        case 'MeetingCheckInPayload':
          break
        case 'MoveReflectTemplatePromptPayload':
          moveReflectTemplatePromptTeamUpdater(payload, context)
          break
        case 'NavigateMeetingPayload':
          navigateMeetingTeamUpdater(payload, store)
          break
        case 'NewMeetingCheckInPayload':
          break
        case 'PromoteToTeamLeadPayload':
          break
        case 'PromoteNewMeetingFacilitatorPayload':
          break
        case 'RemoveOrgUserPayload':
          removeOrgUserTeamUpdater(payload, store, viewerId)
          break
        case 'RemoveReflectTemplatePayload':
          removeReflectTemplateTeamUpdater(payload, context)
          break
        case 'RemoveReflectTemplatePromptPayload':
          removeReflectTemplatePromptTeamUpdater(payload, context)
          break
        case 'RemoveReflectionPayload':
          removeReflectionTeamUpdater(payload, store)
          break
        case 'RemoveTeamMemberPayload':
          removeTeamMemberTeamUpdater(payload, store, viewerId)
          break
        case 'RenameReflectTemplatePayload':
          break
        case 'RenameReflectTemplatePromptPayload':
          break
        case 'ReflectTemplatePromptUpdateDescriptionPayload':
          break
        case 'SelectRetroTemplatePayload':
          break
        case 'SetPhaseFocusPayload':
          break
        case 'StartDraggingReflectionPayload':
          startDraggingReflectionTeamUpdater(payload, context)
          break
        case 'StartNewMeetingPayload':
          break
        case 'UpdateCreditCardPayload':
          break
        case 'UpdateDragLocationPayload':
          break
        case 'UpdateNewCheckInQuestionPayload':
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
    onNext: (result) => {
      if (!result) return
      const {teamSubscription} = result
      const {__typename: type} = teamSubscription
      const handler = onNextHandlers[type]
      if (handler) {
        handler(teamSubscription, {...router, atmosphere})
      }
    },
    onCompleted: () => {
      atmosphere.unregisterSub(TeamSubscription.name, variables)
    }
  })
}

export default TeamSubscription

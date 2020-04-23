import {GraphQLSchema} from 'graphql'
import mutation from './rootMutation'
import query from './rootQuery'
import subscription from './rootSubscription'
import ActionMeeting from './types/ActionMeeting'
import ActionMeetingMember from './types/ActionMeetingMember'
import ActionMeetingSettings from './types/ActionMeetingSettings'
import AgendaItemsPhase from './types/AgendaItemsPhase'
import AuthIdentityGoogle from './types/AuthIdentityGoogle'
import AuthIdentityLocal from './types/AuthIdentityLocal'
import CheckInPhase from './types/CheckInPhase'
import Comment from './types/Comment'
import DiscussPhase from './types/DiscussPhase'
import GenericMeetingPhase from './types/GenericMeetingPhase'
import NotificationTeamInvitation from './types/NotificationTeamInvitation'
import NotifyPromoteToOrgLeader from './types/NotifyPromoteToOrgLeader'
import ReflectPhase from './types/ReflectPhase'
import RetroPhaseItem from './types/RetroPhaseItem'
import RetrospectiveMeeting from './types/RetrospectiveMeeting'
import RetrospectiveMeetingMember from './types/RetrospectiveMeetingMember'
import RetrospectiveMeetingSettings from './types/RetrospectiveMeetingSettings'
import SuggestedActionCreateNewTeam from './types/SuggestedActionCreateNewTeam'
import SuggestedActionInviteYourTeam from './types/SuggestedActionInviteYourTeam'
import SuggestedActionTryActionMeeting from './types/SuggestedActionTryActionMeeting'
import SuggestedActionTryRetroMeeting from './types/SuggestedActionTryRetroMeeting'
import SuggestedActionTryTheDemo from './types/SuggestedActionTryTheDemo'
import SuggestedIntegrationGitHub from './types/SuggestedIntegrationGitHub'
import SuggestedIntegrationJira from './types/SuggestedIntegrationJira'
import TaskIntegrationGitHub from './types/TaskIntegrationGitHub'
import TaskIntegrationJira from './types/TaskIntegrationJira'
import TimelineEventCompletedActionMeeting from './types/TimelineEventCompletedActionMeeting'
import TimelineEventCompletedRetroMeeting from './types/TimelineEventCompletedRetroMeeting'
import TimelineEventJoinedParabol from './types/TimelineEventJoinedParabol'
import TimelineEventTeamCreated from './types/TimelineEventTeamCreated'
import UpdatesPhase from './types/UpdatesPhase'

function hotErrorHandler(err) {
  console.log('ROOT ACCEPT', module.id)
  require.cache[module.id].hot.accept(hotErrorHandler)
}

module.hot.accept(hotErrorHandler)

export default new GraphQLSchema({
  query,
  mutation,
  subscription,
  types: [
    AuthIdentityGoogle,
    AuthIdentityLocal,
    CheckInPhase,
    ReflectPhase,
    DiscussPhase,
    UpdatesPhase,
    AgendaItemsPhase,
    GenericMeetingPhase,
    NotificationTeamInvitation,
    NotifyPromoteToOrgLeader,
    RetroPhaseItem,
    ActionMeeting,
    ActionMeetingMember,
    RetrospectiveMeeting,
    RetrospectiveMeetingMember,
    RetrospectiveMeetingSettings,
    SuggestedActionInviteYourTeam,
    SuggestedActionTryRetroMeeting,
    SuggestedActionTryActionMeeting,
    SuggestedActionCreateNewTeam,
    SuggestedActionTryTheDemo,
    TimelineEventTeamCreated,
    TimelineEventJoinedParabol,
    TimelineEventCompletedRetroMeeting,
    TimelineEventCompletedActionMeeting,
    ActionMeetingSettings,
    TaskIntegrationGitHub,
    TaskIntegrationJira,
    SuggestedIntegrationGitHub,
    SuggestedIntegrationJira,
    Comment
  ]
})

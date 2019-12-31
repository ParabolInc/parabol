import {GraphQLSchema} from 'graphql'
import NotifyPromoteToOrgLeader from './types/NotifyPromoteToOrgLeader'
import NotificationTeamInvitation from './types/NotificationTeamInvitation'
import mutation from './rootMutation'
import query from './rootQuery'
import subscription from './rootSubscription'
import RetroPhaseItem from './types/RetroPhaseItem'
import RetrospectiveMeeting from './types/RetrospectiveMeeting'
import GenericMeetingPhase from './types/GenericMeetingPhase'
import DiscussPhase from './types/DiscussPhase'
import ReflectPhase from './types/ReflectPhase'
import CheckInPhase from './types/CheckInPhase'
import RetrospectiveMeetingSettings from './types/RetrospectiveMeetingSettings'
import ActionMeetingSettings from './types/ActionMeetingSettings'
import RetrospectiveMeetingMember from './types/RetrospectiveMeetingMember'
import SuggestedActionInviteYourTeam from './types/SuggestedActionInviteYourTeam'
import SuggestedActionTryTheDemo from './types/SuggestedActionTryTheDemo'
import SuggestedActionCreateNewTeam from './types/SuggestedActionCreateNewTeam'
import SuggestedActionTryActionMeeting from './types/SuggestedActionTryActionMeeting'
import SuggestedActionTryRetroMeeting from './types/SuggestedActionTryRetroMeeting'
import TimelineEventTeamCreated from './types/TimelineEventTeamCreated'
import TimelineEventJoinedParabol from './types/TimelineEventJoinedParabol'
import TimelineEventCompletedRetroMeeting from './types/TimelineEventCompletedRetroMeeting'
import TimelineEventCompletedActionMeeting from './types/TimelineEventCompletedActionMeeting'
import TaskIntegrationGitHub from './types/TaskIntegrationGitHub'
import SuggestedIntegrationJira from './types/SuggestedIntegrationJira'
import SuggestedIntegrationAzureDevops from './types/SuggestedIntegrationAzureDevops'
import SuggestedIntegrationGitHub from './types/SuggestedIntegrationGitHub'
import TaskIntegrationJira from './types/TaskIntegrationJira'
import TaskIntegrationAzureDevops from './types/TaskIntegrationAzureDevops'
import ActionMeeting from './types/ActionMeeting'
import ActionMeetingMember from './types/ActionMeetingMember'
import UpdatesPhase from './types/UpdatesPhase'
import AgendaItemsPhase from './types/AgendaItemsPhase'
import AuthIdentityGoogle from './types/AuthIdentityGoogle'
import AuthIdentityLocal from './types/AuthIdentityLocal'

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
    TaskIntegrationAzureDevops,
    SuggestedIntegrationGitHub,
    SuggestedIntegrationJira,
    SuggestedIntegrationAzureDevops
  ]
})

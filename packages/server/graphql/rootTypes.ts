import ActionMeeting from './types/ActionMeeting'
import ActionMeetingMember from './types/ActionMeetingMember'
import ActionMeetingSettings from './types/ActionMeetingSettings'
import AgendaItemsPhase from './types/AgendaItemsPhase'
import AuthIdentityGoogle from './types/AuthIdentityGoogle'
import AuthIdentityLocal from './types/AuthIdentityLocal'
import AzureDevOpsWorkItem from './types/AzureDevOpsWorkItem'
import CheckInPhase from './types/CheckInPhase'
import Comment from './types/Comment'
import DiscussPhase from './types/DiscussPhase'
import EstimatePhase from './types/EstimatePhase'
import GenericMeetingPhase from './types/GenericMeetingPhase'
import IntegrationProviderOAuth1 from './types/IntegrationProviderOAuth1'
import IntegrationProviderOAuth2 from './types/IntegrationProviderOAuth2'
import IntegrationProviderWebhook from './types/IntegrationProviderWebhook'
import JiraDimensionField from './types/JiraDimensionField'
import MeetingTemplate from './types/MeetingTemplate'
import PokerMeetingSettings from './types/PokerMeetingSettings'
import PokerTemplate from './types/PokerTemplate'
import ReflectPhase from './types/ReflectPhase'
import RenamePokerTemplatePayload from './types/RenamePokerTemplatePayload'
import RetrospectiveMeeting from './types/RetrospectiveMeeting'
import RetrospectiveMeetingMember from './types/RetrospectiveMeetingMember'
import RetrospectiveMeetingSettings from './types/RetrospectiveMeetingSettings'
import SuggestedActionCreateNewTeam from './types/SuggestedActionCreateNewTeam'
import SuggestedActionInviteYourTeam from './types/SuggestedActionInviteYourTeam'
import SuggestedActionTryActionMeeting from './types/SuggestedActionTryActionMeeting'
import SuggestedActionTryRetroMeeting from './types/SuggestedActionTryRetroMeeting'
import SuggestedActionTryTheDemo from './types/SuggestedActionTryTheDemo'
import TeamPromptMeeting from './types/TeamPromptMeeting'
import TeamPromptMeetingMember from './types/TeamPromptMeetingMember'
import TeamPromptMeetingSettings from './types/TeamPromptMeetingSettings'
import TeamPromptResponsesPhase from './types/TeamPromptResponsesPhase'
import TimelineEventCompletedActionMeeting from './types/TimelineEventCompletedActionMeeting'
import TimelineEventCompletedRetroMeeting from './types/TimelineEventCompletedRetroMeeting'
import TimelineEventJoinedParabol from './types/TimelineEventJoinedParabol'
import TimelineEventPokerComplete from './types/TimelineEventPokerComplete'
import TimelineEventTeamCreated from './types/TimelineEventTeamCreated'
import UpdatesPhase from './types/UpdatesPhase'
import UserTiersCount from './types/UserTiersCount'

const rootTypes = [
  IntegrationProviderOAuth1,
  IntegrationProviderOAuth2,
  IntegrationProviderWebhook,
  AuthIdentityGoogle,
  AuthIdentityLocal,
  CheckInPhase,
  ReflectPhase,
  PokerTemplate,
  MeetingTemplate,
  DiscussPhase,
  UpdatesPhase,
  EstimatePhase,
  AgendaItemsPhase,
  TeamPromptResponsesPhase,
  GenericMeetingPhase,
  EstimatePhase,
  ActionMeeting,
  ActionMeetingMember,
  PokerMeetingSettings,
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
  TimelineEventPokerComplete,
  ActionMeetingSettings,
  TeamPromptMeeting,
  TeamPromptMeetingMember,
  TeamPromptMeetingSettings,
  Comment,
  AzureDevOpsWorkItem,
  JiraDimensionField,
  RenamePokerTemplatePayload,
  UserTiersCount
]
export default rootTypes

import ActionMeetingMember from './types/ActionMeetingMember'
import ActionMeetingSettings from './types/ActionMeetingSettings'
import AgendaItemsPhase from './types/AgendaItemsPhase'
import AuthIdentityGoogle from './types/AuthIdentityGoogle'
import AuthIdentityLocal from './types/AuthIdentityLocal'
import AuthIdentityMicrosoft from './types/AuthIdentityMicrosoft'
import CheckInPhase from './types/CheckInPhase'
import Comment from './types/Comment'
import DiscussPhase from './types/DiscussPhase'
import EstimatePhase from './types/EstimatePhase'
import GenericMeetingPhase from './types/GenericMeetingPhase'
import IntegrationProviderOAuth1 from './types/IntegrationProviderOAuth1'
import IntegrationProviderOAuth2 from './types/IntegrationProviderOAuth2'
import IntegrationProviderWebhook from './types/IntegrationProviderWebhook'
import JiraDimensionField from './types/JiraDimensionField'
import PokerMeetingSettings from './types/PokerMeetingSettings'
import ReflectPhase from './types/ReflectPhase'
import RenamePokerTemplatePayload from './types/RenamePokerTemplatePayload'
import RetrospectiveMeetingMember from './types/RetrospectiveMeetingMember'
import RetrospectiveMeetingSettings from './types/RetrospectiveMeetingSettings'
import SetMeetingSettingsPayload from './types/SetMeetingSettingsPayload'
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
  AuthIdentityMicrosoft,
  AuthIdentityLocal,
  CheckInPhase,
  ReflectPhase,
  DiscussPhase,
  UpdatesPhase,
  EstimatePhase,
  AgendaItemsPhase,
  TeamPromptResponsesPhase,
  GenericMeetingPhase,
  EstimatePhase,
  ActionMeetingMember,
  PokerMeetingSettings,
  RetrospectiveMeetingMember,
  RetrospectiveMeetingSettings,
  SetMeetingSettingsPayload,
  TimelineEventTeamCreated,
  TimelineEventJoinedParabol,
  TimelineEventCompletedRetroMeeting,
  TimelineEventCompletedActionMeeting,
  TimelineEventPokerComplete,
  ActionMeetingSettings,
  TeamPromptMeetingMember,
  TeamPromptMeetingSettings,
  Comment,
  JiraDimensionField,
  RenamePokerTemplatePayload,
  UserTiersCount
]
export default rootTypes

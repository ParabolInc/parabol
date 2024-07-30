import Comment from './types/Comment'
import IntegrationProviderOAuth1 from './types/IntegrationProviderOAuth1'
import IntegrationProviderOAuth2 from './types/IntegrationProviderOAuth2'
import IntegrationProviderWebhook from './types/IntegrationProviderWebhook'
import JiraDimensionField from './types/JiraDimensionField'
import RenamePokerTemplatePayload from './types/RenamePokerTemplatePayload'
import SetMeetingSettingsPayload from './types/SetMeetingSettingsPayload'
import SuggestedActionCreateNewTeam from './types/SuggestedActionCreateNewTeam'
import SuggestedActionInviteYourTeam from './types/SuggestedActionInviteYourTeam'
import SuggestedActionTryActionMeeting from './types/SuggestedActionTryActionMeeting'
import SuggestedActionTryRetroMeeting from './types/SuggestedActionTryRetroMeeting'
import SuggestedActionTryTheDemo from './types/SuggestedActionTryTheDemo'
import TimelineEventCompletedActionMeeting from './types/TimelineEventCompletedActionMeeting'
import TimelineEventCompletedRetroMeeting from './types/TimelineEventCompletedRetroMeeting'
import TimelineEventJoinedParabol from './types/TimelineEventJoinedParabol'
import TimelineEventPokerComplete from './types/TimelineEventPokerComplete'
import TimelineEventTeamCreated from './types/TimelineEventTeamCreated'
import UserTiersCount from './types/UserTiersCount'

const rootTypes = [
  IntegrationProviderOAuth1,
  IntegrationProviderOAuth2,
  IntegrationProviderWebhook,
  SetMeetingSettingsPayload,
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
  Comment,
  JiraDimensionField,
  RenamePokerTemplatePayload,
  UserTiersCount
]
export default rootTypes

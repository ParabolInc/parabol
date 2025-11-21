import type {Team, TeamPromptResponse, User} from '../../../../postgres/types'
import type {AnyMeeting} from '../../../../postgres/types/Meeting'
export type NotifyResponse =
  | 'success'
  | {
      error: Error
      // true if the error is transient
      retry?: boolean
    }

export type NotificationIntegration = {
  startMeeting(meeting: AnyMeeting, team: Team, user: User): Promise<NotifyResponse>
  updateMeeting?(meeting: AnyMeeting, team: Team, user: User): Promise<NotifyResponse>
  endMeeting(
    meeting: AnyMeeting,
    team: Team,
    user: User,
    standupResponses: {user: User; response: TeamPromptResponse}[] | null
  ): Promise<NotifyResponse>
  startTimeLimit(
    scheduledEndTime: Date,
    meeting: AnyMeeting,
    team: Team,
    user: User
  ): Promise<NotifyResponse>
  endTimeLimit(meeting: AnyMeeting, team: Team, user: User): Promise<NotifyResponse>
  integrationUpdated(user: User): Promise<NotifyResponse>
  standupResponseSubmitted(
    meeting: AnyMeeting,
    team: Team,
    user: User,
    response: TeamPromptResponse
  ): Promise<NotifyResponse>
}

export type NotificationIntegrationHelper<NotificationChannel> = (
  notification: NotificationChannel
) => NotificationIntegration

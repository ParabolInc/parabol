import Meeting from '../../../../database/types/Meeting'
import {Team, TeamPromptResponse} from '../../../../postgres/types'
import User from '../../../../postgres/types/IUser'
export type NotifyResponse =
  | 'success'
  | {
      error: Error
      // true if the error is transient
      retry?: boolean
    }

export type NotificationIntegration = {
  startMeeting(meeting: Meeting, team: Team, user: User): Promise<NotifyResponse>
  updateMeeting?(meeting: Meeting, team: Team, user: User): Promise<NotifyResponse>
  endMeeting(
    meeting: Meeting,
    team: Team,
    user: User,
    standupResponses: {user: User; response: TeamPromptResponse}[] | null
  ): Promise<NotifyResponse>
  startTimeLimit(
    scheduledEndTime: Date,
    meeting: Meeting,
    team: Team,
    user: User
  ): Promise<NotifyResponse>
  endTimeLimit(meeting: Meeting, team: Team, user: User): Promise<NotifyResponse>
  integrationUpdated(user: User): Promise<NotifyResponse>
  standupResponseSubmitted(
    meeting: Meeting,
    team: Team,
    user: User,
    response: TeamPromptResponse
  ): Promise<NotifyResponse>
}

export type NotificationIntegrationHelper<NotificationChannel> = (
  notification: NotificationChannel
) => NotificationIntegration

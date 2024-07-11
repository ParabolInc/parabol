import Meeting from '../../../../database/types/Meeting'
import {TeamPromptResponse} from '../../../../postgres/queries/getTeamPromptResponsesByIds'
import User from '../../../../postgres/types/IUser'
import {TeamSource} from '../../../public/types/Team'

export type NotifyResponse =
  | 'success'
  | {
      error: Error
      // true if the error is transient
      retry?: boolean
    }

export type NotificationIntegration = {
  startMeeting(meeting: Meeting, team: TeamSource, user: User): Promise<NotifyResponse>
  updateMeeting?(meeting: Meeting, team: TeamSource, user: User): Promise<NotifyResponse>
  endMeeting(
    meeting: Meeting,
    team: TeamSource,
    user: User,
    standupResponses: {user: User; response: TeamPromptResponse}[] | null
  ): Promise<NotifyResponse>
  startTimeLimit(
    scheduledEndTime: Date,
    meeting: Meeting,
    team: TeamSource,
    user: User
  ): Promise<NotifyResponse>
  endTimeLimit(meeting: Meeting, team: TeamSource, user: User): Promise<NotifyResponse>
  integrationUpdated(user: User): Promise<NotifyResponse>
  standupResponseSubmitted(
    meeting: Meeting,
    team: TeamSource,
    user: User,
    response: TeamPromptResponse
  ): Promise<NotifyResponse>
}

export type NotificationIntegrationHelper<NotificationChannel> = (
  notification: NotificationChannel
) => NotificationIntegration

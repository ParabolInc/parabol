import Meeting from '../../../../database/types/Meeting'
import {Team} from '../../../../postgres/queries/getTeamsByIds'

export type NotifyResponse =
  | 'success'
  | {
      error: Error
      // true if the error is transient
      retry?: boolean
    }

export type NotificationIntegration = {
  startMeeting(meeting: Meeting, team: Team): Promise<NotifyResponse>
  endMeeting(meeting: Meeting, team: Team): Promise<NotifyResponse>
  startTimeLimit(scheduledEndTime: Date, meeting: Meeting, team: Team): Promise<NotifyResponse>
  endTimeLimit(meeting: Meeting, team: Team): Promise<NotifyResponse>
  integrationUpdated(): Promise<NotifyResponse>
}

export type NotificationIntegrationHelper<NotificationChannel> = (
  notification: NotificationChannel
) => NotificationIntegration

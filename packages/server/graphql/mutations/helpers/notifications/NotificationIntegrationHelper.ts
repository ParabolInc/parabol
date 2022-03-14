import {Team} from '../../../../postgres/queries/getTeamsByIds'
import Meeting from '../../../../database/types/Meeting'

export type NotifyResponse =
  | 'success'
  | {
      error: Error
      // true if the error is transient
      retry?: boolean
    }

export type Notifier = {
  startMeeting(meeting: Meeting, team: Team): Promise<NotifyResponse>
  endMeeting(meeting: Meeting, team: Team): Promise<NotifyResponse>
  startTimeLimit(scheduledEndTime: Date, meeting: Meeting, team: Team): Promise<NotifyResponse>
  endTimeLimit(meeting: Meeting, team: Team): Promise<NotifyResponse>
}

export type NotificationIntegrationHelper<NotificationChannel> = (
  notification: NotificationChannel
) => Notifier

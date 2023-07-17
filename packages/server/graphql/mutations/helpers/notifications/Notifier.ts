import {DataLoaderWorker} from '../../../graphql'
import {NotifyResponse} from './NotificationIntegrationHelper'

export type Notifier = {
  startMeeting(dataLoader: DataLoaderWorker, meetingId: string, teamId: string): Promise<void>
  endMeeting(dataLoader: DataLoaderWorker, meetingId: string, teamId: string): Promise<void>
  startTimeLimit(
    dataLoader: DataLoaderWorker,
    scheduledEndTime: Date,
    meetingId: string,
    teamId: string
  ): Promise<void>
  endTimeLimit(dataLoader: DataLoaderWorker, meetingId: string, teamId: string): Promise<void>
  integrationUpdated(dataLoader: DataLoaderWorker, teamId: string, userId: string): Promise<void>
  shareTopic?(
    dataLoader: DataLoaderWorker,
    userId: string,
    teamId: string,
    meetingId: string,
    reflectionGroupId: string,
    stageIndex: number,
    channelId: string
  ): Promise<NotifyResponse>
}

import {DataLoaderWorker} from '../../../graphql'

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
}

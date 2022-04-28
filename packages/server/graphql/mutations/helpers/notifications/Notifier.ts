import {DataLoaderWorker} from '../../../graphql'

/**
 * Empty Notifier prototype to allow iterating the methods typesafe
 */
export const EmptyNotifier = {
  async startMeeting(
    _dataLoader: DataLoaderWorker,
    _meetingId: string,
    _teamId: string
  ): Promise<void> {
    /*empty*/
  },
  async endMeeting(
    _dataLoader: DataLoaderWorker,
    _meetingId: string,
    _teamId: string
  ): Promise<void> {
    /*empty*/
  },
  async startTimeLimit(
    _dataLoader: DataLoaderWorker,
    _scheduledEndTime: Date,
    _meetingId: string,
    _teamId: string
  ): Promise<void> {
    /*empty*/
  },
  async endTimeLimit(
    _dataLoader: DataLoaderWorker,
    _meetingId: string,
    _teamId: string
  ): Promise<void> {
    /*empty*/
  },
  async integrationUpdated(
    _dataLoader: DataLoaderWorker,
    _teamId: string,
    _userId: string
  ): Promise<void> {
    /*empty*/
  }
}

export type Notifier = typeof EmptyNotifier

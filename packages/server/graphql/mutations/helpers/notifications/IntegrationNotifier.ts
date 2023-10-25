import {MattermostNotifier} from './MattermostNotifier'
import {MSTeamsNotifier} from './MSTeamsNotifier'
import {Notifier} from './Notifier'
import {SlackNotifier} from './SlackNotifier'

const notifiers = [MattermostNotifier, SlackNotifier, MSTeamsNotifier]

export const IntegrationNotifier: Notifier = {
  async startMeeting(dataLoader, meetingId, teamId) {
    await Promise.allSettled(
      notifiers.map(async (notifier) => notifier.startMeeting(dataLoader, meetingId, teamId))
    )
  },
  async updateMeeting(dataLoader, meetingId, teamId) {
    await Promise.allSettled(
      notifiers.map(async (notifier) => notifier.updateMeeting?.(dataLoader, meetingId, teamId))
    )
  },
  async endMeeting(dataLoader, meetingId, teamId) {
    await Promise.allSettled(
      notifiers.map(async (notifier) => notifier.endMeeting(dataLoader, meetingId, teamId))
    )
  },
  async startTimeLimit(dataLoader, scheduledEndTime, meetingId, teamId) {
    await Promise.allSettled(
      notifiers.map(async (notifier) =>
        notifier.startTimeLimit(dataLoader, scheduledEndTime, meetingId, teamId)
      )
    )
  },
  async endTimeLimit(dataLoader, meetingId, teamId) {
    await Promise.allSettled(
      notifiers.map(async (notifier) => notifier.endTimeLimit(dataLoader, meetingId, teamId))
    )
  },
  async integrationUpdated(dataLoader, teamId, userId) {
    await Promise.allSettled(
      notifiers.map(async (notifier) => notifier.integrationUpdated(dataLoader, teamId, userId))
    )
  },
  async standupResponseSubmitted(dataLoader, meetingId, teamId, userId) {
    await Promise.allSettled(
      notifiers.map(async (notifier) =>
        notifier.standupResponseSubmitted(dataLoader, meetingId, teamId, userId)
      )
    )
  },
  async sendNotificationToUser(dataLoader, notificationId, userId) {
    await Promise.allSettled(
      notifiers.map(async (notifier) =>
        notifier.sendNotificationToUser?.(dataLoader, notificationId, userId)
      )
    )
  }
}

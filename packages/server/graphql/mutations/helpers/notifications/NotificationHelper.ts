import {IntegrationProviderMattermost} from '../../../../postgres/queries/getIntegrationProvidersByIds'
import Meeting from '../../../../database/types/Meeting'
import {SlackNotificationEvent} from '../../../../database/types/SlackNotification'
import {DataLoaderWorker} from '../../../graphql'
import {MattermostNotificationHelper} from './MattermostNotificationHelper'
import {SlackNotificationHelper} from './SlackNotificationHelper'

async function getSlack(
  dataLoader: DataLoaderWorker,
  event: SlackNotificationEvent,
  teamId: string
) {
  const notifications = await dataLoader
    .get('slackNotificationsByTeamIdAndEvent')
    .load({event, teamId})
  return notifications.map(SlackNotificationHelper)
}

async function getMattermost(dataLoader: DataLoaderWorker, meeting: Meeting, teamId: string) {
  const {facilitatorUserId} = meeting
  const provider = await dataLoader
    .get('bestTeamIntegrationProviders')
    .load({service: 'mattermost', teamId, userId: facilitatorUserId})
  return provider ? [MattermostNotificationHelper(provider as IntegrationProviderMattermost)] : []
}

async function loadMeetingTeam(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
  const [team, meeting] = await Promise.all([
    dataLoader.get('teams').load(teamId),
    dataLoader.get('newMeetings').load(meetingId)
  ])
  return {
    meeting,
    team
  }
}

async function getAllNotifiers(
  dataLoader: DataLoaderWorker,
  event: SlackNotificationEvent,
  meeting: Meeting,
  teamId: string
) {
  const [slack, mattermost] = await Promise.all([
    getSlack(dataLoader, event, teamId),
    getMattermost(dataLoader, meeting, teamId)
  ])

  return [...slack, ...mattermost]
}

export const NotificationHelper = {
  // returning void because otherwise errors would need to be picked apart per integration and this manager should deal with retries
  async startMeeting(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    const notifiers = await getAllNotifiers(dataLoader, 'meetingStart', meeting, team.id)
    notifiers.forEach((notifier) => notifier.startMeeting(meeting, team))
  },

  async endMeeting(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    const notifiers = await getAllNotifiers(dataLoader, 'meetingEnd', meeting, team.id)
    notifiers.forEach((notifier) => notifier.endMeeting(meeting, team))
  },

  async startTimeLimit(
    dataLoader: DataLoaderWorker,
    scheduledEndTime: Date,
    meetingId: string,
    teamId: string
  ) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    const notifiers = await getAllNotifiers(
      dataLoader,
      'MEETING_STAGE_TIME_LIMIT_START',
      meeting,
      team.id
    )
    notifiers.forEach((notifier) => notifier.startTimeLimit(scheduledEndTime, meeting, team))
  },

  async endTimeLimit(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    const notifiers = await getAllNotifiers(
      dataLoader,
      'MEETING_STAGE_TIME_LIMIT_END',
      meeting,
      team.id
    )
    notifiers.forEach((notifier) => notifier.endTimeLimit(meeting, team))
  }
}

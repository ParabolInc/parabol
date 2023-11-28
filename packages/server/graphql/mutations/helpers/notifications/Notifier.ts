import {SlackNotificationEvent} from '../../../../database/types/SlackNotification'
import {getTeamPromptResponsesByMeetingId} from '../../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {DataLoaderWorker} from '../../../graphql'
import {NotificationIntegration, NotifyResponse} from './NotificationIntegrationHelper'

export type Notifier = {
  startMeeting(dataLoader: DataLoaderWorker, meetingId: string, teamId: string): Promise<void>
  updateMeeting?(dataLoader: DataLoaderWorker, meetingId: string, teamId: string): Promise<void>
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
  sendNotificationToUser?(
    dataLoader: DataLoaderWorker,
    notificationId: string,
    userId: string
  ): Promise<void>
  standupResponseSubmitted(
    dataLoader: DataLoaderWorker,
    meetingId: string,
    teamId: string,
    userId: string
  ): Promise<void>
}

export type NotificationIntegrationLoader = (
  dataLoader: DataLoaderWorker,
  teamId: string,
  userId: string,
  event: SlackNotificationEvent
) => Promise<NotificationIntegration[]>

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

export const createNotifier = (loader: NotificationIntegrationLoader): Notifier => ({
  async startMeeting(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    const notifiers = await loader(dataLoader, team.id, meeting.facilitatorUserId, 'meetingStart')
    notifiers.forEach((notifier) => notifier.startMeeting(meeting, team))
  },

  async updateMeeting(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    const notifiers = await loader(dataLoader, team.id, meeting.facilitatorUserId, 'meetingStart')
    notifiers.forEach((notifier) => notifier.updateMeeting?.(meeting, team))
  },

  async endMeeting(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    const meetingResponses = await getTeamPromptResponsesByMeetingId(meetingId)
    const standupResponses = await Promise.all(
      meetingResponses.map(async (response) => {
        const user = await dataLoader.get('users').loadNonNull(response.userId)
        return {
          user,
          response
        }
      })
    )
    const notifiers = await loader(dataLoader, team.id, meeting.facilitatorUserId, 'meetingEnd')
    notifiers.forEach((notifier) => notifier.endMeeting(meeting, team, standupResponses))
  },

  async startTimeLimit(
    dataLoader: DataLoaderWorker,
    scheduledEndTime: Date,
    meetingId: string,
    teamId: string
  ) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    const notifiers = await loader(
      dataLoader,
      team.id,
      meeting.facilitatorUserId,
      'MEETING_STAGE_TIME_LIMIT_START'
    )
    notifiers.forEach((notifier) => notifier.startTimeLimit(scheduledEndTime, meeting, team))
  },

  async endTimeLimit(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    const notifiers = await loader(
      dataLoader,
      team.id,
      meeting.facilitatorUserId,
      'MEETING_STAGE_TIME_LIMIT_END'
    )
    notifiers.forEach((notifier) => notifier.endTimeLimit(meeting, team))
  },

  async integrationUpdated(dataLoader: DataLoaderWorker, teamId: string, userId: string) {
    const notifiers = await loader(dataLoader, teamId, userId, 'meetingEnd')
    notifiers.forEach((notifier) => notifier.integrationUpdated())
  },

  async standupResponseSubmitted(
    dataLoader: DataLoaderWorker,
    meetingId: string,
    teamId: string,
    userId: string
  ) {
    const [{meeting, team}, user, responses] = await Promise.all([
      loadMeetingTeam(dataLoader, meetingId, teamId),
      dataLoader.get('users').load(userId),
      getTeamPromptResponsesByMeetingId(meetingId)
    ])
    const response = responses.find(({userId: responseUserId}) => responseUserId === userId)
    if (!meeting || !team || !response || !user) return
    const notifiers = await loader(
      dataLoader,
      team.id,
      meeting.facilitatorUserId,
      'STANDUP_RESPONSE_SUBMITTED'
    )
    notifiers.forEach((notifier) =>
      notifier.standupResponseSubmitted(meeting, team, user, response)
    )
  }
})

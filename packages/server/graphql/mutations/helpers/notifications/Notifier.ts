import {getTeamPromptResponsesByMeetingId} from '../../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {SlackNotification} from '../../../../postgres/types'
import sendToSentry from '../../../../utils/sendToSentry'
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
  event: SlackNotification['event']
) => Promise<NotificationIntegration[]>

async function loadMeetingTeam(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
  const [team, meeting] = await Promise.all([
    dataLoader.get('teams').load(teamId),
    dataLoader.get('newMeetings').load(meetingId)
  ])
  const user = await dataLoader.get('users').load(meeting?.facilitatorUserId || '')
  return {
    meeting,
    team,
    user
  }
}

const fireAndForget = (
  notifiers: NotificationIntegration[],
  call: (notifier: NotificationIntegration) => Promise<NotifyResponse> | undefined
) => {
  notifiers.forEach((notifier) => {
    call(notifier)?.catch((e) => {
      sendToSentry(e)
    })
  })
}

export const createNotifier = (loader: NotificationIntegrationLoader): Notifier => ({
  async startMeeting(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team, user} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team || !user) return
    const notifiers = await loader(dataLoader, team.id, meeting.facilitatorUserId!, 'meetingStart')
    fireAndForget(notifiers, (notifier) => notifier.startMeeting(meeting, team, user))
  },

  async updateMeeting(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team, user} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team || !user) return
    const notifiers = await loader(dataLoader, team.id, meeting.facilitatorUserId!, 'meetingStart')
    fireAndForget(notifiers, (notifier) => notifier.updateMeeting?.(meeting, team, user))
  },

  async endMeeting(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team, user} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team || !user) return
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
    const notifiers = await loader(dataLoader, team.id, meeting.facilitatorUserId!, 'meetingEnd')
    fireAndForget(notifiers, (notifier) =>
      notifier.endMeeting(meeting, team, user, standupResponses)
    )
  },

  async startTimeLimit(
    dataLoader: DataLoaderWorker,
    scheduledEndTime: Date,
    meetingId: string,
    teamId: string
  ) {
    const {meeting, team, user} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team || !user) return
    const notifiers = await loader(
      dataLoader,
      team.id,
      meeting.facilitatorUserId!,
      'MEETING_STAGE_TIME_LIMIT_START'
    )
    fireAndForget(notifiers, (notifier) =>
      notifier.startTimeLimit(scheduledEndTime, meeting, team, user)
    )
  },

  async endTimeLimit(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team, user} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team || !user) return
    const notifiers = await loader(
      dataLoader,
      team.id,
      meeting.facilitatorUserId!,
      'MEETING_STAGE_TIME_LIMIT_END'
    )
    fireAndForget(notifiers, (notifier) => notifier.endTimeLimit(meeting, team, user))
  },

  async integrationUpdated(dataLoader: DataLoaderWorker, teamId: string, userId: string) {
    const notifiers = await loader(dataLoader, teamId, userId, 'meetingEnd')
    const user = await dataLoader.get('users').load(userId)
    if (!user) return
    fireAndForget(notifiers, (notifier) => notifier.integrationUpdated(user))
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
      meeting.facilitatorUserId!,
      'STANDUP_RESPONSE_SUBMITTED'
    )
    fireAndForget(notifiers, (notifier) =>
      notifier.standupResponseSubmitted(meeting, team, user, response)
    )
  }
})

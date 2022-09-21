import formatTime from 'parabol-client/utils/date/formatTime'
import formatWeekday from 'parabol-client/utils/date/formatWeekday'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import {phaseLabelLookup} from 'parabol-client/utils/meetings/lookups'
import appOrigin from '../../../../appOrigin'
import Meeting from '../../../../database/types/Meeting'
import {SlackNotificationEventEnum as EventEnum} from '../../../../database/types/SlackNotification'
import {IntegrationProviderMattermost} from '../../../../postgres/queries/getIntegrationProvidersByIds'
import {Team} from '../../../../postgres/queries/getTeamsByIds'
import {MeetingTypeEnum} from '../../../../postgres/types/Meeting'
import {toEpochSeconds} from '../../../../utils/epochTime'
import MattermostServerManager from '../../../../utils/MattermostServerManager'
import segmentIo from '../../../../utils/segmentIo'
import sendToSentry from '../../../../utils/sendToSentry'
import {DataLoaderWorker} from '../../../graphql'
import getSummaryText from './getSummaryText'
import {
  makeFieldsAttachment,
  makeHackedButtonPairFields,
  makeHackedFieldButtonValue
} from './makeMattermostAttachments'
import {NotificationIntegrationHelper} from './NotificationIntegrationHelper'
import {Notifier} from './Notifier'

const notifyMattermost = async (
  event: EventEnum,
  webhookUrl: string,
  userId: string,
  teamId: string,
  textOrAttachmentsArray: string | unknown[],
  notificationText?: string
) => {
  const manager = new MattermostServerManager(webhookUrl)
  const result = await manager.postMessage(textOrAttachmentsArray, notificationText)
  if (result instanceof Error) {
    sendToSentry(result, {userId, tags: {teamId, event, webhookUrl}})
    return {
      error: result
    }
  }
  segmentIo.track({
    userId,
    event: 'Mattermost notification sent',
    properties: {
      teamId,
      notificationEvent: event
    }
  })

  return 'success'
}

const makeEndMeetingButtons = (meeting: Meeting) => {
  const {id: meetingId} = meeting
  const searchParams = {
    utm_source: 'mattermost summary',
    utm_medium: 'product',
    utm_campaign: 'after-meeting'
  }
  const options = {searchParams}
  const summaryUrl = makeAppURL(appOrigin, `new-summary/${meetingId}`, options)
  const makeDiscussionButton = (meetingUrl: string) => ({
    label: 'See discussion',
    link: meetingUrl
  })
  const summaryButton = {
    label: 'Review summary',
    link: summaryUrl
  }
  switch (meeting.meetingType) {
    case 'retrospective':
      const retroUrl = makeAppURL(appOrigin, `meet/${meetingId}/discuss/1`)
      return makeHackedButtonPairFields(makeDiscussionButton(retroUrl), summaryButton)
    case 'action':
      const checkInUrl = makeAppURL(appOrigin, `meet/${meetingId}/checkin/1`)
      return makeHackedButtonPairFields(makeDiscussionButton(checkInUrl), summaryButton)
    case 'poker':
      const pokerUrl = makeAppURL(appOrigin, `meet/${meetingId}/estimate/1`)
      const estimateButton = {
        label: 'See estimates',
        link: pokerUrl
      }
      return makeHackedButtonPairFields(estimateButton, summaryButton)
    default:
      throw new Error('Invalid meeting type')
  }
}

type MattermostNotificationAuth = IntegrationProviderMattermost & {userId: string}

const makeTeamPromptStartMeetingNotification = (
  team: Team,
  meeting: Meeting,
  meetingUrl: string
) => {
  return [
    makeFieldsAttachment(
      [
        {
          short: true,
          title: 'Team',
          value: team.name
        },
        {
          short: false,
          value: makeHackedFieldButtonValue({label: 'Submit Response', link: meetingUrl})
        }
      ],
      {
        fallback: `Standup started, submit response: ${meetingUrl}`,
        title: `${meeting.name} is open 💬 `,
        title_link: meetingUrl
      }
    )
  ]
}

const makeGenericStartMeetingNotification = (team: Team, meeting: Meeting, meetingUrl: string) => {
  return [
    makeFieldsAttachment(
      [
        {
          short: true,
          title: 'Team',
          value: team.name
        },
        {
          short: true,
          title: 'Meeting',
          value: meeting.name
        },
        {
          short: false,
          value: makeHackedFieldButtonValue({label: 'Join meeting', link: meetingUrl})
        }
      ],
      {
        fallback: `Meeting started, join: ${meetingUrl}`,
        title: 'Meeting started 👋',
        title_link: meetingUrl
      }
    )
  ]
}

const makeStartMeetingNotificationLookup: Record<
  MeetingTypeEnum,
  (team: Team, meeting: Meeting, meetingUrl: string) => ReturnType<typeof makeFieldsAttachment>[]
> = {
  teamPrompt: makeTeamPromptStartMeetingNotification,
  action: makeGenericStartMeetingNotification,
  retrospective: makeGenericStartMeetingNotification,
  poker: makeGenericStartMeetingNotification
}

const MattermostNotificationHelper: NotificationIntegrationHelper<MattermostNotificationAuth> = (
  notificationChannel
) => ({
  async startMeeting(meeting, team) {
    const {facilitatorUserId} = meeting
    const {webhookUrl} = notificationChannel

    const searchParams = {
      utm_source: 'mattermost meeting start',
      utm_medium: 'product',
      utm_campaign: 'invitations'
    }
    const options = {searchParams}
    const meetingUrl = makeAppURL(appOrigin, `meet/${meeting.id}`, options)
    const notification = makeStartMeetingNotificationLookup[meeting.meetingType](
      team,
      meeting,
      meetingUrl
    )

    return notifyMattermost('meetingStart', webhookUrl, facilitatorUserId, team.id, notification)
  },

  async endMeeting(meeting, team) {
    const {facilitatorUserId} = meeting
    const {webhookUrl} = notificationChannel

    const summaryText = getSummaryText(meeting)
    const meetingUrl = makeAppURL(appOrigin, `meet/${meeting.id}`)
    const attachments = [
      makeFieldsAttachment(
        [
          {
            short: true,
            title: 'Team',
            value: team.name
          },
          {
            short: true,
            title: 'Meeting',
            value: meeting.name
          },
          {
            short: false,
            title: 'Summary',
            value: summaryText
          },
          ...makeEndMeetingButtons(meeting)
        ],
        {
          fallback: `Meeting completed, join: ${meetingUrl}`,
          title: 'Meeting completed 🎉',
          title_link: meetingUrl
        }
      )
    ]
    return notifyMattermost('meetingEnd', webhookUrl, facilitatorUserId, team.id, attachments)
  },

  async startTimeLimit(scheduledEndTime, meeting, team) {
    const {name: meetingName, phases, facilitatorStageId, facilitatorUserId} = meeting
    const {webhookUrl} = notificationChannel

    const {name: teamName} = team
    const stageRes = findStageById(phases, facilitatorStageId)
    const {stage} = stageRes!
    const maybeMeetingShortLink = makeAppURL(
      process.env.INVITATION_SHORTLINK || appOrigin,
      `${meeting.id}`
    )
    const meetingUrl = makeAppURL(appOrigin, `meet/${meeting.id}`)
    const {phaseType} = stage
    const phaseLabel = phaseLabelLookup[phaseType as keyof typeof phaseLabelLookup]

    const fallbackDate = formatWeekday(scheduledEndTime)
    const fallbackTime = formatTime(scheduledEndTime)
    const fallbackZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Eastern Time'
    const fallback = `${fallbackDate} at ${fallbackTime} (${fallbackZone})`
    const constraint = `You have until *<!date^${toEpochSeconds(
      scheduledEndTime
    )}^{date_short_pretty} at {time}|${fallback}>* to complete it.`

    const attachments = [
      makeFieldsAttachment(
        [
          {
            short: true,
            title: 'Team',
            value: teamName
          },
          {
            short: true,
            title: 'Meeting',
            value: meetingName
          },
          {
            short: false,
            value: constraint
          },
          {
            short: false,
            title: 'Link',
            value: `[${maybeMeetingShortLink}](${meetingUrl})`
          },
          {
            short: false,
            value: makeHackedFieldButtonValue({label: 'Open meeting', link: meetingUrl})
          }
        ],
        {
          fallback: `The ${phaseLabel} Phase has begun, see: ${meetingUrl}`,
          title: `The ${phaseLabel} Phase has begun ⏳`,
          title_link: meetingUrl
        }
      )
    ]

    return notifyMattermost(
      'MEETING_STAGE_TIME_LIMIT_START',
      webhookUrl,
      facilitatorUserId,
      team.id,
      attachments
    )
  },
  async endTimeLimit(meeting, team) {
    const {facilitatorUserId: userId} = meeting
    const {webhookUrl} = notificationChannel

    const meetingUrl = makeAppURL(appOrigin, `meet/${meeting.id}`)
    const messageText = `Time’s up! Advance your meeting to the next phase: ${meetingUrl}`

    return notifyMattermost(
      'MEETING_STAGE_TIME_LIMIT_END',
      webhookUrl,
      team.id,
      userId,
      messageText
    )
  },
  async integrationUpdated() {
    const message = `Integration webhook configuration updated`
    const {webhookUrl, teamId, userId} = notificationChannel

    const attachments = [
      makeFieldsAttachment(
        [
          {
            short: false,
            value: message
          }
        ],
        {
          fallback: message
        }
      )
    ]
    return notifyMattermost('meetingEnd', webhookUrl, userId, teamId, attachments)
  }
})

async function getMattermost(dataLoader: DataLoaderWorker, teamId: string, userId: string) {
  const provider = await dataLoader
    .get('bestTeamIntegrationProviders')
    .load({service: 'mattermost', teamId, userId})
  return provider
    ? MattermostNotificationHelper({
        ...(provider as IntegrationProviderMattermost),
        userId
      })
    : null
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

export const MattermostNotifier: Notifier = {
  async startMeeting(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    ;(await getMattermost(dataLoader, team.id, meeting.facilitatorUserId))?.startMeeting(
      meeting,
      team
    )
  },

  async endMeeting(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    ;(await getMattermost(dataLoader, team.id, meeting.facilitatorUserId))?.endMeeting(
      meeting,
      team
    )
  },

  async startTimeLimit(
    dataLoader: DataLoaderWorker,
    scheduledEndTime: Date,
    meetingId: string,
    teamId: string
  ) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    ;(await getMattermost(dataLoader, team.id, meeting.facilitatorUserId))?.startTimeLimit(
      scheduledEndTime,
      meeting,
      team
    )
  },

  async endTimeLimit(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    ;(await getMattermost(dataLoader, team.id, meeting.facilitatorUserId))?.endTimeLimit(
      meeting,
      team
    )
  },

  async integrationUpdated(dataLoader: DataLoaderWorker, teamId: string, userId: string) {
    ;(await getMattermost(dataLoader, teamId, userId))?.integrationUpdated()
  }
}

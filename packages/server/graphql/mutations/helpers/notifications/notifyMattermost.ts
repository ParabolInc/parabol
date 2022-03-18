import formatTime from 'parabol-client/utils/date/formatTime'
import formatWeekday from 'parabol-client/utils/date/formatWeekday'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import {phaseLabelLookup} from 'parabol-client/utils/meetings/lookups'
import appOrigin from '../../../../appOrigin'
import MeetingAction from '../../../../database/types/MeetingAction'
import MeetingPoker from '../../../../database/types/MeetingPoker'
import MeetingRetrospective from '../../../../database/types/MeetingRetrospective'
import {SlackNotificationEventEnum as EventEnum} from '../../../../database/types/SlackNotification'
import {IntegrationProviderMattermost} from '../../../../postgres/queries/getIntegrationProvidersByIds'
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
    return result
  }
  segmentIo.track({
    userId,
    event: 'Mattermost notification sent',
    properties: {
      teamId,
      notificationEvent: event
    }
  })

  return result
}

export const notifyWebhookConfigUpdated = async (
  webhookUrl: string,
  userId: string,
  teamId: string
) => {
  const message = `Integration webhook configuration updated`

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

export const startMattermostMeeting = async (
  meetingId: string,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  const {facilitatorUserId} = meeting

  const [mattermostProvider, team] = await Promise.all([
    dataLoader
      .get('bestTeamIntegrationProviders')
      .load({service: 'mattermost', teamId, userId: facilitatorUserId}),
    dataLoader.get('teams').load(teamId)
  ])
  if (!mattermostProvider || !team) return
  const {webhookUrl} = mattermostProvider as IntegrationProviderMattermost

  const searchParams = {
    utm_source: 'mattermost meeting start',
    utm_medium: 'product',
    utm_campaign: 'invitations'
  }
  const options = {searchParams}
  const meetingUrl = makeAppURL(appOrigin, `meet/${meetingId}`, options)
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
  return notifyMattermost('meetingStart', webhookUrl, facilitatorUserId, teamId, attachments)
}

const makeEndMeetingButtons = (meeting: MeetingRetrospective | MeetingAction | MeetingPoker) => {
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

export const endMattermostMeeting = async (
  meetingId: string,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  const {facilitatorUserId} = meeting
  const [mattermostProvider, team] = await Promise.all([
    dataLoader
      .get('bestTeamIntegrationProviders')
      .load({service: 'mattermost', teamId, userId: facilitatorUserId}),
    dataLoader.get('teams').load(teamId)
  ])
  if (!mattermostProvider || !team) return
  const {webhookUrl} = mattermostProvider as IntegrationProviderMattermost
  const summaryText = getSummaryText(meeting)
  const meetingUrl = makeAppURL(appOrigin, `meet/${meetingId}`)
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
  return notifyMattermost('meetingEnd', webhookUrl, facilitatorUserId, teamId, attachments)
}

export const notifyMattermostTimeLimitStart = async (
  scheduledEndTime: Date,
  meetingId: string,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  const {name: meetingName, phases, facilitatorStageId, facilitatorUserId} = meeting

  const [mattermostProvider, team] = await Promise.all([
    dataLoader
      .get('bestTeamIntegrationProviders')
      .load({service: 'mattermost', teamId, userId: facilitatorUserId}),
    dataLoader.get('teams').load(teamId)
  ])
  if (!mattermostProvider || !team) return
  const {webhookUrl} = mattermostProvider as IntegrationProviderMattermost

  const {name: teamName} = team
  const stageRes = findStageById(phases, facilitatorStageId)
  const {stage} = stageRes!
  const maybeMeetingShortLink = makeAppURL(
    process.env.INVITATION_SHORTLINK || appOrigin,
    `${meetingId}`
  )
  const meetingUrl = makeAppURL(appOrigin, `meet/${meetingId}`)
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
    teamId,
    attachments
  )
}

export const notifyMattermostTimeLimitEnd = async (
  meetingId: string,
  teamId: string,
  webhookUrl: string,
  dataLoader: DataLoaderWorker
) => {
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  const {facilitatorUserId: userId} = meeting
  const meetingUrl = makeAppURL(appOrigin, `meet/${meetingId}`)
  const messageText = `Time’s up! Advance your meeting to the next phase: ${meetingUrl}`

  return notifyMattermost('MEETING_STAGE_TIME_LIMIT_END', webhookUrl, teamId, userId, messageText)
}

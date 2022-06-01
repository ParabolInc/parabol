import * as AdaptiveCards from 'adaptivecards'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import {phaseLabelLookup} from 'parabol-client/utils/meetings/lookups'
import appOrigin from '../../../../appOrigin'
import Meeting from '../../../../database/types/Meeting'
import {SlackNotificationEventEnum as EventEnum} from '../../../../database/types/SlackNotification'
import {IntegrationProviderMSTeams} from '../../../../postgres/queries/getIntegrationProvidersByIds'
import {Team} from '../../../../postgres/queries/getTeamsByIds'
import MSTeamsServerManager from '../../../../utils/MSTeamsServerManager'
import segmentIo from '../../../../utils/segmentIo'
import sendToSentry from '../../../../utils/sendToSentry'
import {DataLoaderWorker} from '../../../graphql'
import getSummaryText from './getSummaryText'
import {NotificationIntegrationHelper} from './NotificationIntegrationHelper'
import {Notifier} from './Notifier'

const notifyMSTeams = async (
  event: EventEnum,
  webhookUrl: string,
  userId: string,
  teamId: string,
  textOrAttachmentsArray: string | unknown[]
) => {
  const manager = new MSTeamsServerManager(webhookUrl)
  const result = await manager.post(textOrAttachmentsArray)
  if (result instanceof Error) {
    sendToSentry(result, {userId, tags: {teamId, event, webhookUrl}})
    return {
      error: result
    }
  }
  segmentIo.track({
    userId,
    event: 'MSTeams notification sent',
    properties: {
      teamId,
      notificationEvent: event
    }
  })

  return 'success'
}
export type MSTeamsNotificationAuth = IntegrationProviderMSTeams & {userId: string}

export const MSTeamsNotificationHelper: NotificationIntegrationHelper<MSTeamsNotificationAuth> = (
  notificationChannel
) => ({
  async startMeeting(meeting, team) {
    const {facilitatorUserId} = meeting
    const {webhookUrl} = notificationChannel

    const searchParams = {
      utm_source: 'MS Teams meeting start',
      utm_medium: 'product',
      utm_campaign: 'invitations'
    }
    const options = {searchParams}
    const meetingUrl = makeAppURL(appOrigin, `meet/${meeting.id}`, options)
    const urlLink = `https:/prbl.in/${meeting.id}`
    const card = new AdaptiveCards.AdaptiveCard()
    card.version = new AdaptiveCards.Version(1.2, 0)

    const meetingTitle = 'Meeting Started 👋'
    const titleTextBlock = GenerateACMeetingTitle(meetingTitle)
    card.addItem(titleTextBlock)

    const meetingDetailColumnSet = GenerateACMeetingAndTeamsDetails(team, meeting)
    card.addItem(meetingDetailColumnSet)

    const meetingLinkColumnSet = new AdaptiveCards.ColumnSet()
    meetingLinkColumnSet.spacing = AdaptiveCards.Spacing.ExtraLarge
    const meetingLinkColumn = new AdaptiveCards.Column()
    meetingLinkColumn.width = 'stretch'
    const meetingLinkHeaderTextBlock = new AdaptiveCards.TextBlock('Link: ')
    meetingLinkHeaderTextBlock.wrap = true
    meetingLinkHeaderTextBlock.weight = AdaptiveCards.TextWeight.Bolder
    const meetingLinkTextBlock = new AdaptiveCards.TextBlock(urlLink)
    meetingLinkTextBlock.color = AdaptiveCards.TextColor.Accent
    meetingLinkTextBlock.size = AdaptiveCards.TextSize.Small
    meetingLinkTextBlock.wrap = true
    const joinMeetingActionSet = new AdaptiveCards.ActionSet()
    const joinMeetingAction = new AdaptiveCards.OpenUrlAction()
    joinMeetingAction.title = 'Join Meeting'
    joinMeetingAction.url = meetingUrl
    joinMeetingAction.id = 'joinMeeting'

    joinMeetingActionSet.addAction(joinMeetingAction)

    meetingLinkColumn.addItem(meetingLinkHeaderTextBlock)
    meetingLinkColumn.addItem(meetingLinkTextBlock)
    meetingLinkColumn.addItem(joinMeetingActionSet)

    meetingLinkColumnSet.addColumn(meetingLinkColumn)

    card.addItem(meetingLinkColumnSet)

    const adaptiveCard = JSON.stringify(card.toJSON())

    const attachments = MakeACAttachment(adaptiveCard)

    return notifyMSTeams('meetingStart', webhookUrl, facilitatorUserId, team.id, attachments)
  },

  async endMeeting(meeting, team) {
    const {facilitatorUserId} = meeting
    const {webhookUrl} = notificationChannel
    const searchParams = {
      utm_source: 'MS Teams meeting start',
      utm_medium: 'product',
      utm_campaign: 'invitations'
    }
    const options = {searchParams}
    const meetingUrl = makeAppURL(appOrigin, `meet/${meeting.id}`)
    const summaryUrl = makeAppURL(appOrigin, `new-summary/${meeting.id}`, options)
    const card = new AdaptiveCards.AdaptiveCard()
    card.version = new AdaptiveCards.Version(1.2, 0)

    const meetingTitle = 'Meeting Ended 🎉'
    const titleTextBlock = GenerateACMeetingTitle(meetingTitle)
    card.addItem(titleTextBlock)

    const meetingDetailColumnSet = GenerateACMeetingAndTeamsDetails(team, meeting)
    card.addItem(meetingDetailColumnSet)

    const summaryColumnSet = new AdaptiveCards.ColumnSet()
    summaryColumnSet.spacing = AdaptiveCards.Spacing.ExtraLarge
    const summaryColumn = new AdaptiveCards.Column()
    summaryColumn.width = 'stretch'
    const summaryTextBlock = new AdaptiveCards.TextBlock(getSummaryText(meeting))
    summaryTextBlock.wrap = true
    summaryColumn.addItem(summaryTextBlock)
    summaryColumnSet.addColumn(summaryColumn)
    card.addItem(summaryColumnSet)

    const meetingEndedActionsColumnSet = new AdaptiveCards.ColumnSet()
    meetingEndedActionsColumnSet.spacing = AdaptiveCards.Spacing.ExtraLarge
    const meetingEndedDiscussionColumn = new AdaptiveCards.Column()
    meetingEndedDiscussionColumn.width = 'auto'
    const meetingEndedReviewColumn = new AdaptiveCards.Column()
    meetingEndedReviewColumn.width = 'auto'

    const meetingEndedDiscussionActionSet = new AdaptiveCards.ActionSet()
    const meetingEndedDiscussionAction = new AdaptiveCards.OpenUrlAction()
    meetingEndedDiscussionAction.title = 'See discussion'
    meetingEndedDiscussionAction.url = meetingUrl
    meetingEndedDiscussionAction.id = 'joinMeeting'

    meetingEndedDiscussionActionSet.addAction(meetingEndedDiscussionAction)
    meetingEndedDiscussionColumn.addItem(meetingEndedDiscussionActionSet)

    const meetingEndedReviewActionSet = new AdaptiveCards.ActionSet()
    const meetingEndedReviewAction = new AdaptiveCards.OpenUrlAction()
    meetingEndedReviewAction.title = 'Review summary'
    meetingEndedReviewAction.url = summaryUrl
    meetingEndedReviewAction.id = 'joinMeeting'

    meetingEndedDiscussionActionSet.addAction(meetingEndedReviewAction)
    meetingEndedDiscussionColumn.addItem(meetingEndedReviewActionSet)

    meetingEndedActionsColumnSet.addColumn(meetingEndedDiscussionColumn)
    meetingEndedActionsColumnSet.addColumn(meetingEndedReviewColumn)

    card.addItem(meetingEndedActionsColumnSet)

    const adaptiveCard = JSON.stringify(card.toJSON())
    const attachments = MakeACAttachment(adaptiveCard)
    return notifyMSTeams('meetingEnd', webhookUrl, facilitatorUserId, team.id, attachments)
  },

  async startTimeLimit(scheduledEndTime, meeting, team) {
    const {webhookUrl} = notificationChannel

    const {phases, facilitatorStageId, facilitatorUserId} = meeting

    const maybeMeetingShortLink = makeAppURL(process.env.INVITATION_SHORTLINK!, `${meeting.id}`)
    const meetingUrl = makeAppURL(appOrigin, `meet/${meeting.id}`)

    const stageRes = findStageById(phases, facilitatorStageId)
    const {stage} = stageRes!
    const {phaseType} = stage
    const phaseLabel = phaseLabelLookup[phaseType]

    const meetingTitle = `The **${phaseLabel} Phase** has begun ⌛`

    const card = new AdaptiveCards.AdaptiveCard()
    card.version = new AdaptiveCards.Version(1.2, 0)

    const titleTextBlock = GenerateACMeetingTitle(meetingTitle)
    card.addItem(titleTextBlock)

    const meetingDetailColumnSet = GenerateACMeetingAndTeamsDetails(team, meeting)
    card.addItem(meetingDetailColumnSet)

    const teamFixedTime = scheduledEndTime.toISOString().replace(/.\d+Z$/g, 'Z')
    const timeLimitText = `You have until {{DATE(${teamFixedTime},SHORT)}} at {{TIME(${teamFixedTime})}} to complete it.`

    const timeLimitColumnSet = new AdaptiveCards.ColumnSet()
    timeLimitColumnSet.spacing = AdaptiveCards.Spacing.ExtraLarge
    const timeLimitColumn = new AdaptiveCards.Column()
    timeLimitColumn.width = 'stretch'
    const timeLimitTextBlock = new AdaptiveCards.TextBlock(timeLimitText)
    timeLimitTextBlock.wrap = true

    timeLimitColumn.addItem(timeLimitTextBlock)
    timeLimitColumnSet.addColumn(timeLimitColumn)

    card.addItem(timeLimitColumnSet)

    const meetingLinkColumnSet = new AdaptiveCards.ColumnSet()
    meetingLinkColumnSet.spacing = AdaptiveCards.Spacing.ExtraLarge
    const meetingLinkColumn = new AdaptiveCards.Column()
    meetingLinkColumn.width = 'stretch'
    const meetingLinkHeaderTextBlock = new AdaptiveCards.TextBlock('Link: ')
    meetingLinkHeaderTextBlock.wrap = true
    meetingLinkHeaderTextBlock.weight = AdaptiveCards.TextWeight.Bolder
    const meetingLinkTextBlock = new AdaptiveCards.TextBlock(maybeMeetingShortLink)
    meetingLinkTextBlock.color = AdaptiveCards.TextColor.Accent
    meetingLinkTextBlock.size = AdaptiveCards.TextSize.Small
    meetingLinkTextBlock.wrap = true
    const joinMeetingActionSet = new AdaptiveCards.ActionSet()
    const joinMeetingAction = new AdaptiveCards.OpenUrlAction()
    joinMeetingAction.title = 'Open Meeting'
    joinMeetingAction.url = meetingUrl
    joinMeetingAction.id = 'openMeeting'

    joinMeetingActionSet.addAction(joinMeetingAction)

    meetingLinkColumn.addItem(meetingLinkHeaderTextBlock)
    meetingLinkColumn.addItem(meetingLinkTextBlock)
    meetingLinkColumn.addItem(joinMeetingActionSet)

    meetingLinkColumnSet.addColumn(meetingLinkColumn)

    card.addItem(meetingLinkColumnSet)

    const adaptiveCard = JSON.stringify(card.toJSON())
    const attachments = MakeACAttachment(adaptiveCard)

    return notifyMSTeams(
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

    const card = new AdaptiveCards.AdaptiveCard()
    card.version = new AdaptiveCards.Version(1.2, 0)

    const meetingUrl = makeAppURL(appOrigin, `meet/${meeting.id}`)

    const meetingLinkColumnSet = new AdaptiveCards.ColumnSet()
    meetingLinkColumnSet.spacing = AdaptiveCards.Spacing.ExtraLarge
    const meetingLinkColumn = new AdaptiveCards.Column()
    meetingLinkColumn.width = 'stretch'

    const meetingLinkHeaderTextBlock = new AdaptiveCards.TextBlock(
      'Time’s up! Advance your meeting to the next phase'
    )
    meetingLinkHeaderTextBlock.wrap = true
    meetingLinkHeaderTextBlock.weight = AdaptiveCards.TextWeight.Bolder
    const meetingLinkTextBlock = new AdaptiveCards.TextBlock(meetingUrl)
    meetingLinkTextBlock.color = AdaptiveCards.TextColor.Accent
    meetingLinkTextBlock.size = AdaptiveCards.TextSize.Small
    meetingLinkTextBlock.wrap = true
    const joinMeetingActionSet = new AdaptiveCards.ActionSet()
    const joinMeetingAction = new AdaptiveCards.OpenUrlAction()
    joinMeetingAction.title = 'Advance Meeting'
    joinMeetingAction.url = meetingUrl
    joinMeetingAction.id = 'advanceMeeting'

    joinMeetingActionSet.addAction(joinMeetingAction)

    meetingLinkColumn.addItem(meetingLinkHeaderTextBlock)
    meetingLinkColumn.addItem(meetingLinkTextBlock)
    meetingLinkColumn.addItem(joinMeetingActionSet)

    meetingLinkColumnSet.addColumn(meetingLinkColumn)

    card.addItem(meetingLinkColumnSet)

    const adaptiveCard = JSON.stringify(card.toJSON())
    const attachments = MakeACAttachment(adaptiveCard)

    return notifyMSTeams('MEETING_STAGE_TIME_LIMIT_END', webhookUrl, userId, team.id, attachments)
  },
  async integrationUpdated() {
    const {webhookUrl, teamId, userId} = notificationChannel

    const card = new AdaptiveCards.AdaptiveCard()
    card.version = new AdaptiveCards.Version(1.2, 0)

    const messageColumnSet = new AdaptiveCards.ColumnSet()
    messageColumnSet.spacing = AdaptiveCards.Spacing.ExtraLarge
    const messageColumn = new AdaptiveCards.Column()
    messageColumn.width = 'stretch'

    const messageTextBlock = new AdaptiveCards.TextBlock(
      'Integration webhook configuration updated'
    )
    messageTextBlock.wrap = true
    messageTextBlock.weight = AdaptiveCards.TextWeight.Bolder
    messageColumn.addItem(messageTextBlock)
    messageColumnSet.addColumn(messageColumn)
    card.addItem(messageColumnSet)

    const adaptiveCard = JSON.stringify(card.toJSON())
    const attachments = MakeACAttachment(adaptiveCard)
    return notifyMSTeams('meetingEnd', webhookUrl, userId, teamId, attachments)
  }
})

async function getMSTeams(dataLoader: DataLoaderWorker, teamId: string, userId: string) {
  const provider = await dataLoader
    .get('bestTeamIntegrationProviders')
    .load({service: 'msTeams', teamId, userId})
  return provider
    ? MSTeamsNotificationHelper({
        ...(provider as IntegrationProviderMSTeams),
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
export const MSTeamsNotifier: Notifier = {
  async startMeeting(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    ;(await getMSTeams(dataLoader, team.id, meeting.facilitatorUserId))?.startMeeting(meeting, team)
  },

  async endMeeting(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    ;(await getMSTeams(dataLoader, team.id, meeting.facilitatorUserId))?.endMeeting(meeting, team)
  },

  async startTimeLimit(
    dataLoader: DataLoaderWorker,
    scheduledEndTime: Date,
    meetingId: string,
    teamId: string
  ) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    ;(await getMSTeams(dataLoader, team.id, meeting.facilitatorUserId))?.startTimeLimit(
      scheduledEndTime,
      meeting,
      team
    )
  },

  async endTimeLimit(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    ;(await getMSTeams(dataLoader, team.id, meeting.facilitatorUserId))?.endTimeLimit(meeting, team)
  },

  async integrationUpdated(dataLoader: DataLoaderWorker, teamId: string, userId: string) {
    ;(await getMSTeams(dataLoader, teamId, userId))?.integrationUpdated()
  }
}

function GenerateACMeetingTitle(meetingTitle: string) {
  const titleTextBlock = new AdaptiveCards.TextBlock(meetingTitle)
  titleTextBlock.wrap = true
  titleTextBlock.size = AdaptiveCards.TextSize.Large
  titleTextBlock.weight = AdaptiveCards.TextWeight.Bolder
  return titleTextBlock
}

function GenerateACMeetingAndTeamsDetails(team: Team, meeting: Meeting) {
  const meetingDetailColumnSet = new AdaptiveCards.ColumnSet()
  const teamDetailColumn = new AdaptiveCards.Column()
  teamDetailColumn.width = 'stretch'
  const teamHeaderTextBlock = new AdaptiveCards.TextBlock('Team: ')
  teamHeaderTextBlock.wrap = true
  teamHeaderTextBlock.weight = AdaptiveCards.TextWeight.Bolder
  const teamValueTextBlock = new AdaptiveCards.TextBlock(team.name)
  teamValueTextBlock.wrap = true

  teamDetailColumn.addItem(teamHeaderTextBlock)
  teamDetailColumn.addItem(teamValueTextBlock)

  const meetingDetailColumn = new AdaptiveCards.Column()
  meetingDetailColumn.width = 'stretch'
  const meetingHeaderTextBlock = new AdaptiveCards.TextBlock('Meeting: ')
  meetingHeaderTextBlock.wrap = true
  meetingHeaderTextBlock.weight = AdaptiveCards.TextWeight.Bolder
  const meetingValueTextBlock = new AdaptiveCards.TextBlock(meeting.name)
  meetingValueTextBlock.wrap = true

  meetingDetailColumn.addItem(meetingHeaderTextBlock)
  meetingDetailColumn.addItem(meetingValueTextBlock)

  meetingDetailColumnSet.addColumn(teamDetailColumn)
  meetingDetailColumnSet.addColumn(meetingDetailColumn)
  return meetingDetailColumnSet
}

function MakeACAttachment(card: string) {
  return `{"type":"message", "attachments":[{"contentType":"application/vnd.microsoft.card.adaptive","contentUrl":null, "content": ${card}}]}`
}

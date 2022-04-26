import * as AdaptiveCards from 'adaptivecards'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import formatTime from 'parabol-client/utils/date/formatTime'
import formatWeekday from 'parabol-client/utils/date/formatWeekday'
// import findStageById from 'parabol-client/utils/meetings/findStageById'
import appOrigin from '../../../../appOrigin'
import {MSTeamsNotificationEventEnum as EventEnum} from '../../../../database/types/MSTeamsNotifications'
import {IntegrationProviderMSTeams} from '../../../../postgres/queries/getIntegrationProvidersByIds'
import {Team} from '../../../../postgres/queries/getTeamsByIds'
// import { AnyMeeting } from '../../../../postgres/types/Meeting'
import MSTeamsServerManager from '../../../../utils/MSTeamsServerManager'
import segmentIo from '../../../../utils/segmentIo'
import sendToSentry from '../../../../utils/sendToSentry'
import getSummaryText from './getSummaryText'
import {NotificationIntegrationHelper} from './NotificationIntegrationHelper'
import Meeting from '../../../../database/types/Meeting'
// import {phaseLabelLookup} from 'parabol-client/utils/meetings/lookups'
import {toEpochSeconds} from '../../../../utils/epochTime'

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
export type MSTeamsNotificationAuth = IntegrationProviderMSTeams

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
    const meetingLinkTextBlock = new AdaptiveCards.TextBlock()
    meetingLinkTextBlock.text = urlLink
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

    const adaptivecard = JSON.stringify(card.toJSON())

    const attachments = `{"type":"message", "attachments":[{"contentType":"application/vnd.microsoft.card.adaptive","contentUrl":null, "content": ${adaptivecard}}]}`

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
    const summaryTextBlock = new AdaptiveCards.TextBlock()
    summaryTextBlock.text = getSummaryText(meeting)
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

    const adaptivecard = JSON.stringify(card.toJSON())
    const attachments = `{"type":"message", "attachments":[{"contentType":"application/vnd.microsoft.card.adaptive","contentUrl":null, "content": ${adaptivecard}}]}`

    return notifyMSTeams('meetingEnd', webhookUrl, facilitatorUserId, team.id, attachments)
  },

  async startTimeLimit(scheduledEndTime, meeting, team) {
    const {facilitatorUserId} = meeting
    const {webhookUrl} = notificationChannel

    // const {name: teamName} = team
    // const stageRes = findStageById(phases, facilitatorStageId)
    // const {stage} = stageRes!
    // const maybeMeetingShortLink = makeAppURL(
    //   process.env.INVITATION_SHORTLINK || appOrigin,
    //   `${meeting.id}`
    // )
    // const meetingUrl = makeAppURL(appOrigin, `meet/${meeting.id}`)
    // const {phaseType} = stage
    // const phaseLabel = phaseLabelLookup[phaseType]

    const fallbackDate = formatWeekday(scheduledEndTime)
    const fallbackTime = formatTime(scheduledEndTime)
    const fallbackZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Eastern Time'
    const fallback = `${fallbackDate} at ${fallbackTime} (${fallbackZone})`
    const constraint = `You have until *<!date^${toEpochSeconds(
      scheduledEndTime
    )}^{date_short_pretty} at {time}|${fallback}>* to complete it.`

    return notifyMSTeams(
      'MEETING_STAGE_TIME_LIMIT_START',
      webhookUrl,
      facilitatorUserId,
      team.id,
      constraint
    )
  },
  async endTimeLimit(meeting, team) {
    const {facilitatorUserId: userId} = meeting
    const {webhookUrl} = notificationChannel

    const meetingUrl = makeAppURL(appOrigin, `meet/${meeting.id}`)
    const messageText = `Time’s up! Advance your meeting to the next phase: ${meetingUrl}`

    return notifyMSTeams('MEETING_STAGE_TIME_LIMIT_END', webhookUrl, team.id, userId, messageText)
  }
})

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
  const teamValueTextBlock = new AdaptiveCards.TextBlock()
  teamValueTextBlock.text = team.name
  teamValueTextBlock.wrap = true

  teamDetailColumn.addItem(teamHeaderTextBlock)
  teamDetailColumn.addItem(teamValueTextBlock)

  const meetingDetailColumn = new AdaptiveCards.Column()
  meetingDetailColumn.width = 'stretch'
  const meetingHeaderTextBlock = new AdaptiveCards.TextBlock('Meeting: ')
  meetingHeaderTextBlock.wrap = true
  meetingHeaderTextBlock.weight = AdaptiveCards.TextWeight.Bolder
  const meetingValueTextBlock = new AdaptiveCards.TextBlock()
  meetingValueTextBlock.text = meeting.name
  meetingValueTextBlock.wrap = true

  meetingDetailColumn.addItem(meetingHeaderTextBlock)
  meetingDetailColumn.addItem(meetingValueTextBlock)

  meetingDetailColumnSet.addColumn(teamDetailColumn)
  meetingDetailColumnSet.addColumn(meetingDetailColumn)
  return meetingDetailColumnSet
}

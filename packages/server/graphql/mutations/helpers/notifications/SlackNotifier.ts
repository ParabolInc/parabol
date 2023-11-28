import formatTime from 'parabol-client/utils/date/formatTime'
import formatWeekday from 'parabol-client/utils/date/formatWeekday'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import {phaseLabelLookup} from 'parabol-client/utils/meetings/lookups'
import appOrigin from '../../../../appOrigin'
import getRethink, {RethinkSchema} from '../../../../database/rethinkDriver'
import Meeting from '../../../../database/types/Meeting'
import {SlackNotificationEvent} from '../../../../database/types/SlackNotification'
import {SlackNotificationAuth} from '../../../../dataloader/integrationAuthLoaders'
import {Team} from '../../../../postgres/queries/getTeamsByIds'
import {AnyMeeting, MeetingTypeEnum} from '../../../../postgres/types/Meeting'
import {toEpochSeconds} from '../../../../utils/epochTime'
import sendToSentry from '../../../../utils/sendToSentry'
import SlackServerManager from '../../../../utils/SlackServerManager'
import {DataLoaderWorker} from '../../../graphql'
import getSummaryText from './getSummaryText'
import {makeButtons, makeHeader, makeSection, makeSections} from './makeSlackBlocks'
import {NotificationIntegrationHelper} from './NotificationIntegrationHelper'
import {createNotifier} from './Notifier'
import SlackAuth from '../../../../database/types/SlackAuth'
import {getTeamPromptResponsesByMeetingId} from '../../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {ErrorResponse, PostMessageResponse} from '../../../../../client/utils/SlackManager'
import {TeamPromptResponse} from '../../../../postgres/queries/getTeamPromptResponsesByIds'
import User from '../../../../postgres/types/IUser'
import {convertToMarkdown} from '../../../../utils/tiptap/convertToMarkdown'
import {analytics} from '../../../../utils/analytics/analytics'

type SlackNotification = {
  title: string
  blocks: string | Array<{type: string}>
}

type NotificationChannel = {
  auth: SlackAuth
  channelId: string | null
}

const handleError = async (
  res: PostMessageResponse | ErrorResponse,
  teamId: string,
  notificationChannel: NotificationChannel
) => {
  const {channelId, auth} = notificationChannel
  if ('error' in res) {
    const {error} = res
    if (error === 'channel_not_found') {
      const r = await getRethink()
      await r
        .table('SlackNotification')
        .getAll(teamId, {index: 'teamId'})
        .filter({channelId})
        .update({
          channelId: null
        })
        .run()
      return {
        error: new Error('channel_not_found')
      }
    } else if (error === 'not_in_channel' || error === 'invalid_auth') {
      sendToSentry(
        new Error(`Slack Channel Notification Error: ${teamId}, ${channelId}, ${auth.id}`)
      )
      return {
        error: new Error(error)
      }
    } else {
      sendToSentry(new Error(error))
      return {
        error: new Error(error)
      }
    }
  }

  return 'success'
}

const notifySlack = async (
  notificationChannel: NotificationChannel,
  event: SlackNotificationEvent,
  teamId: string,
  slackMessage: string | Array<{type: string}>,
  notificationText?: string,
  ts?: string,
  reflectionGroupId?: string
): Promise<PostMessageResponse | ErrorResponse> => {
  const {channelId, auth} = notificationChannel
  const {botAccessToken, userId} = auth
  const manager = new SlackServerManager(botAccessToken!)
  const res = await manager.postMessage(channelId!, slackMessage, notificationText, ts)
  analytics.slackNotificationSent(userId, teamId, event, reflectionGroupId)

  return res
}

const makeEndMeetingButtons = (meeting: Meeting) => {
  const {id: meetingId} = meeting
  const searchParams = {
    utm_source: 'slack summary',
    utm_medium: 'product',
    utm_campaign: 'after-meeting'
  }
  const options = {searchParams}
  const summaryUrl = makeAppURL(appOrigin, `new-summary/${meetingId}`, options)
  const makeDiscussionButton = (meetingUrl: string) => ({
    text: 'See discussion',
    url: meetingUrl
  })
  const summaryButton = {
    text: 'Review summary',
    url: summaryUrl
  } as const
  switch (meeting.meetingType) {
    case 'retrospective':
      const retroUrl = makeAppURL(appOrigin, `meet/${meetingId}/discuss/1`)
      return makeButtons([makeDiscussionButton(retroUrl), summaryButton])
    case 'action':
      const checkInUrl = makeAppURL(appOrigin, `meet/${meetingId}/checkin/1`)
      return makeButtons([makeDiscussionButton(checkInUrl), summaryButton])
    case 'poker':
      const pokerUrl = makeAppURL(appOrigin, `meet/${meetingId}/estimate/1`)
      const estimateButton = {
        text: 'See estimates',
        url: pokerUrl
      }
      return makeButtons([estimateButton, summaryButton])
    case 'teamPrompt':
      const teamPromptUrl = makeAppURL(appOrigin, `meet/${meetingId}/responses`)
      const responsesButton = {
        text: 'See responses',
        url: teamPromptUrl
      }
      return makeButtons([responsesButton, summaryButton])
    default:
      throw new Error('Invalid meeting type')
  }
}

const createTeamSectionContent = (team: Team) => `*Team:*\n${team.name}`

const createMeetingSectionContent = (meeting: Meeting) => `*Meeting:*\n${meeting.name}`

const makeTeamPromptStartMeetingNotification = (
  team: Team,
  meeting: Meeting,
  meetingUrl: string
): SlackNotification => {
  const title = `*${meeting.name}* is open :speech_balloon: `
  const blocks = [
    makeSection(title),
    makeSection(createTeamSectionContent(team)), // TODO: add end date once we have it implemented
    makeButtons([{text: 'Submit Response', url: meetingUrl, type: 'primary'}])
  ]

  return {title, blocks}
}

const makeGenericStartMeetingNotification = (
  team: Team,
  meeting: Meeting,
  meetingUrl: string
): SlackNotification => {
  const title = 'Meeting started :wave: '
  const blocks = [
    makeSection(title),
    makeSections([createTeamSectionContent(team), createMeetingSectionContent(meeting)]),
    makeButtons([{text: 'Join meeting', url: meetingUrl, type: 'primary'}])
  ]

  return {title, blocks}
}

const makeStartMeetingNotificationLookup: Record<
  MeetingTypeEnum,
  (team: Team, meeting: Meeting, meetingUrl: string) => SlackNotification
> = {
  teamPrompt: makeTeamPromptStartMeetingNotification,
  action: makeGenericStartMeetingNotification,
  retrospective: makeGenericStartMeetingNotification,
  poker: makeGenericStartMeetingNotification
}

const addStandupResponsesToThread = async (
  res: PostMessageResponse,
  standupResponses: Array<{user: User; response: TeamPromptResponse}> | null,
  team: Team,
  meeting: Meeting,
  notificationChannel: NotificationChannel
) => {
  if (!standupResponses || standupResponses.length === 0) {
    const message = 'No responses were submitted'
    const threadRes = await notifySlack(
      notificationChannel,
      'meetingEnd',
      team.id,
      message,
      message,
      res.ts
    )
    if ('error' in threadRes) {
      return handleError(threadRes, team.id, notificationChannel)
    }
    return 'success'
  }

  const results = await Promise.all(
    standupResponses.map(async ({user, response}) => {
      const options = {
        searchParams: {
          utm_source: 'slack standup summary',
          utm_medium: 'product',
          utm_campaign: 'after-meeting',
          responseId: response.id
        }
      }
      const responseUrl = makeAppURL(appOrigin, `meet/${meeting.id}/responses`, options)

      const threadBlocks: Array<{type: string}> = [
        makeHeader(`${user.preferredName} responded:`),
        makeSection(convertToMarkdown(response.content), true),
        makeButtons([{text: 'See their response', url: responseUrl, type: 'primary'}])
      ]
      const threadRes = await notifySlack(
        notificationChannel,
        'meetingEnd',
        team.id,
        threadBlocks,
        undefined,
        res.ts
      )
      if ('error' in threadRes) {
        return handleError(threadRes, team.id, notificationChannel)
      }
      return 'success'
    })
  )

  // Return the first error if one exists.
  const error = results.find((res) => res !== 'success')
  if (error) {
    return error
  }
  return 'success'
}

const getSlackMessageForNotification = async (
  dataLoader: DataLoaderWorker,
  notification: RethinkSchema['Notification']['type'],
  meeting: AnyMeeting,
  userId: string
) => {
  if (notification.type === 'RESPONSE_REPLIED') {
    const responses = await getTeamPromptResponsesByMeetingId(notification.meetingId)
    const responseId = responses.find(({userId: responseUserId}) => responseUserId === userId)?.id
    if (!responseId) {
      return null
    }
    const author = await dataLoader.get('users').loadNonNull(notification.authorId)
    const comment = await dataLoader.get('comments').load(notification.commentId)
    return {
      responseId,
      title: `*${author.preferredName}* replied to your response in *${meeting.name}*`,
      body: `> ${comment.plaintextContent}`,
      buttonText: 'See the discussion'
    }
  } else if (notification.type === 'RESPONSE_MENTIONED') {
    const responseId = notification.responseId
    const response = await dataLoader.get('teamPromptResponses').loadNonNull(responseId)
    const author = await dataLoader.get('users').loadNonNull(response.userId)
    return {
      responseId,
      title: `*${author.preferredName}* mentioned you in their response in *${meeting.name}*`,
      buttonText: 'See their response'
    }
  }

  return null
}

export const SlackSingleChannelNotifier: NotificationIntegrationHelper<SlackNotificationAuth> = (
  notificationChannel
) => ({
  async startMeeting(meeting, team) {
    const searchParams = {
      utm_source: 'slack meeting start',
      utm_medium: 'product',
      utm_campaign: 'invitations'
    }
    const options = {searchParams}
    const meetingUrl = makeAppURL(appOrigin, `meet/${meeting.id}`, options)
    const {title, blocks} = makeStartMeetingNotificationLookup[meeting.meetingType](
      team,
      meeting,
      meetingUrl
    )

    const res = await notifySlack(notificationChannel, 'meetingStart', team.id, blocks, title)
    if ('error' in res) {
      return handleError(res, team.id, notificationChannel)
    }
    if ('ts' in res) {
      const r = await getRethink()
      await r.table('NewMeeting').get(meeting.id).update({slackTs: res.ts}).run()
    }
    return 'success'
  },

  async updateMeeting(meeting, team) {
    const {channelId, auth} = notificationChannel
    const {botAccessToken} = auth
    const {slackTs} = meeting
    if (!slackTs || !botAccessToken || !channelId) {
      return handleError(
        {ok: false, error: 'missing slackTs, botAccessToken, or channelId'},
        team.id,
        notificationChannel
      )
    }

    const searchParams = {
      utm_source: 'slack meeting start',
      utm_medium: 'product',
      utm_campaign: 'invitations'
    }
    const options = {searchParams}
    const meetingUrl = makeAppURL(appOrigin, `meet/${meeting.id}`, options)
    const {blocks} = makeStartMeetingNotificationLookup[meeting.meetingType](
      team,
      meeting,
      meetingUrl
    )

    const manager = new SlackServerManager(botAccessToken)
    const res = await manager.updateMessage(channelId, blocks, slackTs)

    if ('error' in res) {
      return handleError(res, team.id, notificationChannel)
    }
    if ('ts' in res) {
      const r = await getRethink()
      await r.table('NewMeeting').get(meeting.id).update({slackTs: res.ts}).run()
    }
    return 'success'
  },

  async endMeeting(meeting, team, standupResponses) {
    const summaryText = await getSummaryText(meeting)
    const title = 'Meeting completed :tada:'
    const blocks: Array<{type: string}> = [
      makeSection(title),
      makeSections([createTeamSectionContent(team), createMeetingSectionContent(meeting)]),
      makeSection(summaryText)
    ]
    if (meeting.summary) {
      const aiSummaryTitle = 'AI Summary :robot_face:'
      blocks.push(makeSection(`*${aiSummaryTitle}*:\n${meeting.summary}`))
    }
    blocks.push(makeEndMeetingButtons(meeting))
    const res = await notifySlack(notificationChannel, 'meetingEnd', team.id, blocks, title)
    if ('error' in res) {
      return handleError(res, team.id, notificationChannel)
    }
    if (meeting.meetingType !== 'teamPrompt') {
      return 'success'
    }

    return addStandupResponsesToThread(res, standupResponses, team, meeting, notificationChannel)
  },

  async startTimeLimit(scheduledEndTime, meeting, team) {
    const {phases, facilitatorStageId} = meeting
    const stageRes = findStageById(phases, facilitatorStageId)
    const {stage} = stageRes!
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
    const button = {text: 'Open meeting', url: meetingUrl, type: 'primary'} as const
    const title = `The *${phaseLabel} Phase* has begun :hourglass_flowing_sand:`
    const blocks = [
      makeSection(title),
      makeSections([createTeamSectionContent(team), createMeetingSectionContent(meeting)]),
      makeSection(constraint),
      makeButtons([button])
    ]
    const res = await notifySlack(
      notificationChannel,
      'MEETING_STAGE_TIME_LIMIT_START',
      team.id,
      blocks,
      title
    )
    if ('error' in res) {
      return handleError(res, team.id, notificationChannel)
    }
    return 'success'
  },

  async endTimeLimit(meeting, team) {
    const meetingUrl = makeAppURL(appOrigin, `meet/${meeting.id}`)
    // TODO now is a good time to make the message nice with the `meetingName`
    const slackText = `Time’s up! Advance your meeting to the next phase: ${meetingUrl}`
    const res = await notifySlack(
      notificationChannel,
      'MEETING_STAGE_TIME_LIMIT_END',
      team.id,
      slackText
    )

    if ('error' in res) {
      return handleError(res, team.id, notificationChannel)
    }
    return 'success'
  },

  async integrationUpdated() {
    // Slack sends a system message on its own
    return 'success'
  },

  async standupResponseSubmitted(meeting, team, user, response) {
    const options = {
      searchParams: {
        utm_source: 'slack standup submission',
        utm_medium: 'product',
        utm_campaign: 'notifications',
        responseId: response.id
      }
    }
    const responseUrl = makeAppURL(appOrigin, `meet/${meeting.id}/responses`, options)
    const title = `${user.preferredName} has added their response in ${meeting.name}`
    const blocks: Array<{type: string}> = [
      makeSection(title),
      makeButtons([{text: 'See their response', url: responseUrl, type: 'primary'}])
    ]
    const res = await notifySlack(
      notificationChannel,
      'STANDUP_RESPONSE_SUBMITTED',
      team.id,
      blocks,
      title
    )
    if ('error' in res) {
      return handleError(res, team.id, notificationChannel)
    }
    return 'success'
  }
})

async function getSlack(
  dataLoader: DataLoaderWorker,
  teamId: string,
  _userId: string,
  event: SlackNotificationEvent
) {
  const notifications = await dataLoader
    .get('slackNotificationsByTeamIdAndEvent')
    .load({event, teamId})
  return notifications.map(SlackSingleChannelNotifier)
}

const getDmSlackForMeeting = async (
  dataLoader: DataLoaderWorker,
  meeting: Meeting,
  userId: string
) => {
  // Order of slack auth is:
  // 1. Auth on team
  // 2. Auth in org (auth team is in same org as meeting team)
  // 3. Any auth for user
  const userSlackAuths = (await dataLoader.get('slackAuthByUserId').load(userId)).filter(
    (auth) => !!auth.botAccessToken
  )

  // If the user has an integration on the meeting's team, just use that.
  const teamAuth = userSlackAuths.find((auth) => auth.teamId === meeting.teamId)
  if (teamAuth) {
    return teamAuth
  }

  // If the user has an integration on a team in the meeting's org, use that.
  const meetingTeamOrgId = (await dataLoader.get('teams').loadNonNull(meeting.teamId)).orgId
  const teamIdsInOrg = (await dataLoader.get('teamsByOrgIds').load(meetingTeamOrgId)).map(
    (team) => team.id
  )
  const orgAuth = userSlackAuths.find((auth) => teamIdsInOrg.includes(auth.teamId))
  if (orgAuth) {
    return orgAuth
  }

  // If the user does not have an integration within the meeting's org, use any integration outside
  // the org
  return userSlackAuths[0]
}

export const SlackNotifier = {
  ...createNotifier(getSlack),
  async shareTopic(
    dataLoader: DataLoaderWorker,
    userId: string,
    teamId: string,
    meetingId: string,
    reflectionGroupId: string,
    stageIndex: number,
    channelId: string
  ) {
    const r = await getRethink()
    const [team, meeting, reflectionGroup, reflections, slackAuth] = await Promise.all([
      dataLoader.get('teams').loadNonNull(teamId),
      dataLoader.get('newMeetings').load(meetingId),
      dataLoader.get('retroReflectionGroups').load(reflectionGroupId),
      r.table('RetroReflection').getAll(reflectionGroupId, {index: 'reflectionGroupId'}).run(),
      r
        .table('SlackAuth')
        .getAll(userId, {index: 'userId'})
        .filter({teamId})
        .nth(0)
        .default(null)
        .run()
    ])

    if (!slackAuth) {
      throw new Error('Slack auth not found')
    }

    const {botAccessToken} = slackAuth
    const manager = new SlackServerManager(botAccessToken!)

    const channelInfo = await manager.getConversationInfo(channelId)
    if (!channelInfo.ok) {
      throw new Error(channelInfo.error)
    }
    const {channel} = channelInfo
    const {is_member: isMember, is_archived: isArchived} = channel
    if (isArchived) {
      throw new Error('Slack channel archived')
    }
    if (!isMember) {
      const joinConvoRes = await manager.joinConversation(channelId)
      if (!joinConvoRes.ok) {
        throw new Error('Unable to join slack channel')
      }
    }

    const topic = reflectionGroup.title
    const options = {
      searchParams: {
        utm_source: 'slack share',
        utm_medium: 'product',
        utm_campaign: 'sharing'
      }
    }
    const discussionUrl = makeAppURL(
      appOrigin,
      `meet/${meetingId}/discuss/${stageIndex + 1}`,
      options
    )
    const meetingUrl = makeAppURL(appOrigin, `meet/${meetingId}`, options)

    const reflectionsText = reflections
      .map((reflection) => `• ${reflection.plaintextContent}`)
      .join('\n')

    const slackBlocks = [
      makeSection(
        `<@${slackAuth.slackUserId}> has shared reflections about *"${topic}"* from their retrospective`
      ),
      makeSections([`*Team:*\n${team.name}`, `*Meeting:*\n<${meetingUrl}|${meeting.name}>`]),
      makeSection(`*Topic:*\n<${discussionUrl}|${topic}>`)
    ]

    if (reflectionGroup.summary) {
      slackBlocks.push(makeSection(`*Summary:*\n${reflectionGroup.summary}`))
    }

    slackBlocks.push(makeSection(`*Reflections:* \n${reflectionsText}`))

    const notificationChannel = {
      channelId,
      auth: slackAuth
    }

    const res = await notifySlack(
      notificationChannel,
      'TOPIC_SHARED',
      team.id,
      slackBlocks,
      undefined,
      undefined,
      reflectionGroupId
    )
    if ('error' in res) {
      return handleError(res, team.id, notificationChannel)
    }
    return 'success'
  },

  async sendNotificationToUser(
    dataLoader: DataLoaderWorker,
    notificationId: string,
    userId: string
  ) {
    const notification = await dataLoader.get('notifications').load(notificationId)
    if (notification.type !== 'RESPONSE_MENTIONED' && notification.type !== 'RESPONSE_REPLIED') {
      return
    }

    const meeting = await dataLoader.get('newMeetings').load(notification.meetingId)

    const userSlackAuth = await getDmSlackForMeeting(dataLoader, meeting, userId)
    if (!userSlackAuth) {
      return
    }

    const slackMessageFields = await getSlackMessageForNotification(
      dataLoader,
      notification,
      meeting,
      userId
    )
    if (!slackMessageFields) {
      return
    }

    const {responseId, title, buttonText, body} = slackMessageFields

    if (!responseId) {
      return
    }

    const options = {
      searchParams: {
        utm_source: 'slack standup notification',
        utm_medium: 'product',
        utm_campaign: 'notifications',
        responseId
      }
    }

    const responseUrl = makeAppURL(appOrigin, `meet/${notification.meetingId}/responses`, options)
    const blocks: Array<{type: string}> = [
      makeSection(title),
      ...(body ? [makeSection(body)] : []),
      makeButtons([{text: buttonText, url: responseUrl, type: 'primary'}])
    ]

    const {botAccessToken} = userSlackAuth
    const manager = new SlackServerManager(botAccessToken!)
    manager.postMessage(userSlackAuth.slackUserId, blocks, title)
  }
}

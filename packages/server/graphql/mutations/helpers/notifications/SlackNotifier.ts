import formatTime from 'parabol-client/utils/date/formatTime'
import formatWeekday from 'parabol-client/utils/date/formatWeekday'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import {phaseLabelLookup} from 'parabol-client/utils/meetings/lookups'
import TeamPromptResponseId from '../../../../../client/shared/gqlIds/TeamPromptResponseId'
import {ErrorResponse, PostMessageResponse} from '../../../../../client/utils/SlackManager'
import appOrigin from '../../../../appOrigin'
import SlackAuth from '../../../../database/types/SlackAuth'
import {SlackNotificationAuth} from '../../../../dataloader/integrationAuthLoaders'
import getKysely from '../../../../postgres/getKysely'
import {getTeamPromptResponsesByMeetingId} from '../../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {SlackNotification, Team, TeamPromptResponse} from '../../../../postgres/types'
import User from '../../../../postgres/types/IUser'
import {AnyMeeting, MeetingTypeEnum} from '../../../../postgres/types/Meeting'
import {AnyNotification} from '../../../../postgres/types/Notification'
import SlackServerManager from '../../../../utils/SlackServerManager'
import {analytics} from '../../../../utils/analytics/analytics'
import {toEpochSeconds} from '../../../../utils/epochTime'
import sendToSentry from '../../../../utils/sendToSentry'
import {convertToMarkdown} from '../../../../utils/tiptap/convertToMarkdown'
import {DataLoaderWorker} from '../../../graphql'
import {NotificationIntegrationHelper} from './NotificationIntegrationHelper'
import {createNotifier} from './Notifier'
import getSummaryText from './getSummaryText'
import {makeButtons, makeHeader, makeSection, makeSections} from './makeSlackBlocks'

type SlackNotificationMessage = {
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
      await getKysely()
        .updateTable('SlackNotification')
        .set({channelId: null})
        .where('teamId', '=', teamId)
        .where('channelId', '=', channelId)
        .execute()
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
  event: SlackNotification['event'],
  teamId: string,
  user: User,
  slackMessage: string | Array<{type: string}>,
  notificationText?: string,
  ts?: string,
  reflectionGroupId?: string
): Promise<PostMessageResponse | ErrorResponse> => {
  const {channelId, auth} = notificationChannel
  const {botAccessToken} = auth
  const manager = new SlackServerManager(botAccessToken!)
  const res = await manager.postMessage(channelId!, slackMessage, notificationText, ts)
  analytics.slackNotificationSent(user, teamId, event, reflectionGroupId)

  return res
}

const makeEndMeetingButtons = (meeting: AnyMeeting) => {
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

const createMeetingSectionContent = (meeting: AnyMeeting) => `*Meeting:*\n${meeting.name}`

const makeTeamPromptStartMeetingNotification = (
  team: Team,
  meeting: AnyMeeting,
  meetingUrl: string
): SlackNotificationMessage => {
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
  meeting: AnyMeeting,
  meetingUrl: string
): SlackNotificationMessage => {
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
  (team: Team, meeting: AnyMeeting, meetingUrl: string) => SlackNotificationMessage
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
  user: User,
  meeting: AnyMeeting,
  notificationChannel: NotificationChannel
) => {
  if (!standupResponses || standupResponses.length === 0) {
    const message = 'No responses were submitted'
    const threadRes = await notifySlack(
      notificationChannel,
      'meetingEnd',
      team.id,
      user,
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
          responseId: TeamPromptResponseId.join(response.id)
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
        user,
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
  notification: AnyNotification,
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
    const comment = await dataLoader.get('comments').loadNonNull(notification.commentId)

    const authorName = comment.isAnonymous ? 'Anonymous' : author.preferredName

    const options = {
      searchParams: {
        utm_source: 'slack standup notification',
        utm_medium: 'product',
        utm_campaign: 'notifications',
        responseId: TeamPromptResponseId.join(responseId)
      }
    }

    const buttonUrl = makeAppURL(appOrigin, `meet/${notification.meetingId}/responses`, options)
    return {
      buttonUrl,
      title: `*${authorName}* replied to your response in *${meeting.name}*`,
      body: `> ${comment.plaintextContent}`,
      buttonText: 'See the discussion'
    }
  } else if (notification.type === 'RESPONSE_MENTIONED') {
    const responseId = notification.responseId
    const response = await dataLoader.get('teamPromptResponses').loadNonNull(responseId)
    const author = await dataLoader.get('users').loadNonNull(response.userId)
    const title = `*${author.preferredName}* mentioned you in their response in *${meeting.name}*`

    const options = {
      searchParams: {
        utm_source: 'slack standup notification',
        utm_medium: 'product',
        utm_campaign: 'notifications',
        responseId: TeamPromptResponseId.join(notification.responseId)
      }
    }

    const buttonUrl = makeAppURL(appOrigin, `meet/${notification.meetingId}/responses`, options)

    return {
      buttonUrl,
      title,
      buttonText: 'See their response'
    }
  } else if (notification.type === 'MENTIONED') {
    // This type is no longer created anywhere in the app but is still in the DB.
    // We should remove this logic & the remaining DB notifications
    const authorName = notification.senderName ?? 'Someone'
    const {meetingId} = notification

    let location = 'message'
    let buttonText = 'See their message'
    const searchParams = {
      utm_source: 'slack mention notification',
      utm_medium: 'product',
      utm_campaign: 'notifications'
    }
    let buttonUrl = makeAppURL(appOrigin, `meet/${meetingId}`, {
      searchParams
    })

    if (notification.retroDiscussStageIdx) {
      buttonText = 'See their reflection'
      location = 'reflection'
      buttonUrl = makeAppURL(
        appOrigin,
        `meet/${meetingId}/discuss/${notification.retroDiscussStageIdx}`,
        {
          searchParams
        }
      )
    }

    const title = `*${authorName}* mentioned you in their ${location} in *${meeting.name}*`

    return {
      buttonUrl,
      title,
      buttonText
    }
  }

  return null
}

export const SlackSingleChannelNotifier: NotificationIntegrationHelper<SlackNotificationAuth> = (
  notificationChannel
) => ({
  async startMeeting(meeting, team, user) {
    const searchParams = {
      utm_source: 'slack meeting start',
      utm_medium: 'product',
      utm_campaign: 'invitations'
    }
    const options = {searchParams}
    const meetingUrl = makeAppURL(appOrigin, `meet/${meeting.id}`, options)
    const {title, blocks} = makeStartMeetingNotificationLookup[meeting.meetingType]!(
      team,
      meeting,
      meetingUrl
    )

    const res = await notifySlack(notificationChannel, 'meetingStart', team.id, user, blocks, title)
    if ('error' in res) {
      return handleError(res, team.id, notificationChannel)
    }
    if ('ts' in res) {
      await getKysely()
        .updateTable('NewMeeting')
        .set({slackTs: Number(res.ts)})
        .where('id', '=', meeting.id)
        .execute()
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
    const {blocks} = makeStartMeetingNotificationLookup[meeting.meetingType]!(
      team,
      meeting,
      meetingUrl
    )

    const manager = new SlackServerManager(botAccessToken)
    const res = await manager.updateMessage(channelId, blocks, String(slackTs))

    if ('error' in res) {
      return handleError(res, team.id, notificationChannel)
    }
    if ('ts' in res) {
      await getKysely()
        .updateTable('NewMeeting')
        .set({slackTs: Number(res.ts)})
        .where('id', '=', meeting.id)
        .execute()
    }
    return 'success'
  },

  async endMeeting(meeting, team, user, standupResponses) {
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
    const res = await notifySlack(notificationChannel, 'meetingEnd', team.id, user, blocks, title)
    if ('error' in res) {
      return handleError(res, team.id, notificationChannel)
    }
    if (meeting.meetingType !== 'teamPrompt') {
      return 'success'
    }

    return addStandupResponsesToThread(
      res,
      standupResponses,
      team,
      user,
      meeting,
      notificationChannel
    )
  },

  async startTimeLimit(scheduledEndTime, meeting, team, user) {
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
      user,
      blocks,
      title
    )
    if ('error' in res) {
      return handleError(res, team.id, notificationChannel)
    }
    return 'success'
  },

  async endTimeLimit(meeting, team, user) {
    const meetingUrl = makeAppURL(appOrigin, `meet/${meeting.id}`)
    const title = `Time’s up! Advance your meeting to the next phase :alarm_clock:`
    const button = {text: 'Open meeting', url: meetingUrl, type: 'primary'} as const
    const blocks = [
      makeSection(title),
      makeSections([createTeamSectionContent(team), createMeetingSectionContent(meeting)]),
      makeButtons([button])
    ]

    const res = await notifySlack(
      notificationChannel,
      'MEETING_STAGE_TIME_LIMIT_END',
      team.id,
      user,
      blocks,
      title
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
        responseId: TeamPromptResponseId.join(response.id)
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
      user,
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
  event: SlackNotification['event']
) {
  const notifications = await dataLoader
    .get('slackNotificationsByTeamIdAndEvent')
    .load({event, teamId})
  return notifications.map(SlackSingleChannelNotifier)
}

const getDmSlackForMeeting = async (
  dataLoader: DataLoaderWorker,
  meeting: AnyMeeting,
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
    const [team, user, meeting, reflectionGroup, reflections, userSlackAuths] = await Promise.all([
      dataLoader.get('teams').loadNonNull(teamId),
      dataLoader.get('users').loadNonNull(userId),
      dataLoader.get('newMeetings').loadNonNull(meetingId),
      dataLoader.get('retroReflectionGroups').loadNonNull(reflectionGroupId),
      dataLoader.get('retroReflectionsByGroupId').load(reflectionGroupId),
      dataLoader.get('slackAuthByUserId').load(userId)
    ])
    const slackAuth = userSlackAuths.find((auth) => auth.teamId === teamId)
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

    slackBlocks.push(makeSection(`*Reflections:* \n${reflectionsText}`))

    const notificationChannel = {
      channelId,
      auth: slackAuth
    }

    const res = await notifySlack(
      notificationChannel,
      'TOPIC_SHARED',
      team.id,
      user,
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
    const notification = await dataLoader.get('notifications').loadNonNull(notificationId)
    if (
      notification.type !== 'RESPONSE_MENTIONED' &&
      notification.type !== 'RESPONSE_REPLIED' &&
      notification.type !== 'MENTIONED'
    ) {
      return
    }

    const meeting = await dataLoader.get('newMeetings').loadNonNull(notification.meetingId)

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

    const {buttonUrl, title, buttonText, body} = slackMessageFields

    if (!buttonUrl) {
      return
    }

    const blocks: Array<{type: string}> = [
      makeSection(title),
      ...(body ? [makeSection(body)] : []),
      makeButtons([{text: buttonText, url: buttonUrl, type: 'primary'}])
    ]

    const {botAccessToken} = userSlackAuth
    const manager = new SlackServerManager(botAccessToken!)
    manager.postMessage(userSlackAuth.slackUserId, blocks, title)
  }
}

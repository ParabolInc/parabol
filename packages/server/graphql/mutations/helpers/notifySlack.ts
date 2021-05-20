import ms from 'ms'
import {Unpromise} from 'parabol-client/types/generics'
import formatTime from 'parabol-client/utils/date/formatTime'
import formatWeekday from 'parabol-client/utils/date/formatWeekday'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import {phaseLabelLookup} from 'parabol-client/utils/meetings/lookups'
import getRethink from '../../../database/rethinkDriver'
import SlackAuth from '../../../database/types/SlackAuth'
import SlackNotification, {SlackNotificationEvent} from '../../../database/types/SlackNotification'
import {toEpochSeconds} from '../../../utils/epochTime'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import segmentIo from '../../../utils/segmentIo'
import sendToSentry from '../../../utils/sendToSentry'
import SlackServerManager from '../../../utils/SlackServerManager'
import errorFilter from '../../errorFilter'
import {DataLoaderWorker} from '../../graphql'
import appOrigin from '../../../appOrigin'
import relativeDate from 'parabol-client/utils/date/relativeDate'
import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import MeetingAction from '../../../database/types/MeetingAction'
import MeetingPoker from '../../../database/types/MeetingPoker'
import plural from 'parabol-client/utils/plural'
import EstimatePhase from '../../../database/types/EstimatePhase'
import {makeSections, makeButtons} from './makeSlackBlocks'

const getSlackDetails = async (
  event: SlackNotificationEvent,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const notificationsByTeamId = await dataLoader.get('slackNotificationsByTeamId').load(teamId)
  const notifications = notificationsByTeamId.filter((notification) => notification.event === event)
  const usedChannelIds = new Set()
  const distinctChannelNotifications = [] as SlackNotification[]
  for (let ii = 0; ii < notifications.length; ii++) {
    const notification = notifications[ii]
    const {channelId} = notification
    if (!channelId || usedChannelIds.has(channelId)) continue
    usedChannelIds.add(channelId)
    distinctChannelNotifications.push(notification)
  }
  const notificationUserIds = distinctChannelNotifications.map(({userId}) => userId)
  const userSlackAuths = (
    await dataLoader.get('slackAuthByUserId').loadMany(notificationUserIds)
  ).filter(errorFilter)
  return userSlackAuths.map((userSlackAuthArr, idx) => {
    const auth = userSlackAuthArr.find((val) => val.teamId === teamId) as SlackAuth
    return {auth, notification: distinctChannelNotifications[idx]}
  })
}

/* eslint-disable no-await-in-loop */
const notifySlack = async (
  event: SlackNotificationEvent,
  dataLoader: DataLoaderWorker,
  teamId: string,
  slackMessage: string | Array<{type: string}>
) => {
  const r = await getRethink()
  const slackDetails = await getSlackDetails(event, teamId, dataLoader)
  // for each slack channel, send a notification
  for (let i = 0; i < slackDetails.length; i++) {
    const {notification, auth} = slackDetails[i]
    const {channelId} = notification
    const {botAccessToken, userId} = auth
    const manager = new SlackServerManager(botAccessToken)
    const res = await manager.postMessage(channelId!, slackMessage)
    segmentIo.track({
      userId,
      event: 'Slack notification sent',
      properties: {
        teamId,
        notificationEvent: event
      }
    })
    if ('error' in res) {
      const {error} = res
      if (error === 'channel_not_found') {
        await r
          .table('SlackNotification')
          .getAll(teamId, {index: 'teamId'})
          .filter({channelId})
          .update({
            channelId: null
          })
          .run()
      } else if (error === 'not_in_channel' || error === 'invalid_auth') {
        sendToSentry(
          new Error(`Slack Channel Notification Error: ${teamId}, ${channelId}, ${auth.id}`)
        )
      }
    }
  }
}

export const startSlackMeeting = async (
  meetingId: string,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const searchParams = {
    utm_source: 'slack meeting start',
    utm_medium: 'product',
    utm_campaign: 'invitations'
  }
  const options = {searchParams}
  const [team, meeting] = await Promise.all([
    dataLoader.get('teams').load(teamId),
    dataLoader.get('newMeetings').load(meetingId)
  ])
  const meetingUrl = makeAppURL(appOrigin, `meet/${meetingId}`, options)
  const button = {text: 'Join meeting', url: meetingUrl, type: 'primary'} as const
  const blocks = [
    makeSections(['Meeting started :wave: ']),
    makeSections([`*Team:*\n${team.name}`, `*Meeting:*\n${meeting.name}`]),
    makeSections([`*Link:*\n${meetingUrl}`]),
    makeButtons([button])
  ]
  notifySlack('meetingStart', dataLoader, teamId, blocks).catch(console.log)
}

const getSummaryText = (meeting: MeetingRetrospective | MeetingAction | MeetingPoker) => {
  if ('reflectionCount' in meeting) {
    const {commentCount = 0, reflectionCount = 0, topicCount = 0, taskCount = 0} = meeting
    return `Your team shared ${reflectionCount} ${plural(
      reflectionCount,
      'reflection'
    )} and grouped them into ${topicCount} topics.\nYou added ${commentCount} ${plural(
      commentCount,
      'comment'
    )} and created ${taskCount} ${plural(taskCount, 'task')}.`
  } else if ('agendaItemCount' in meeting) {
    const {createdAt, endedAt, agendaItemCount = 0, commentCount = 0, taskCount = 0} = meeting
    const meetingDuration = relativeDate(createdAt, {
      now: endedAt,
      max: 2,
      suffix: false,
      smallDiff: 'less than a minute'
    })
    return `It lasted ${meetingDuration} and generated ${taskCount} ${plural(
      taskCount,
      'task'
    )}, ${agendaItemCount} ${plural(agendaItemCount, 'agenda item')} and ${commentCount} ${plural(
      commentCount,
      'comment'
    )}.`
  } else {
    const estimatePhase = meeting.phases.find(
      (phase) => phase.phaseType === 'ESTIMATE'
    ) as EstimatePhase
    const stages = estimatePhase.stages
    const storyCount = new Set(stages.map(({serviceTaskId}) => serviceTaskId)).size
    return `You voted on ${storyCount} ${plural(storyCount, 'story', 'stories')}.`
  }
}

export const endSlackMeeting = async (meetingId, teamId, dataLoader: DataLoaderWorker) => {
  const searchParams = {
    utm_source: 'slack summary',
    utm_medium: 'product',
    utm_campaign: 'after-meeting'
  }
  const options = {searchParams}
  const [team, meeting] = await Promise.all([
    dataLoader.get('teams').load(teamId),
    dataLoader.get('newMeetings').load(meetingId)
  ])
  const summaryUrl = makeAppURL(appOrigin, `new-summary/${meetingId}`, options)
  const meetingUrl = makeAppURL(appOrigin, `meet/${meetingId}/discuss/1`)
  const pokerUrl = makeAppURL(appOrigin, `meet/${meetingId}/estimate/1`)
  const summaryText = getSummaryText(meeting)
  const {name: teamName} = team
  const {meetingType, name: meetingName} = meeting
  const discussionButton = {
    text: meetingType === 'poker' ? 'See estimates' : 'See discussion',
    url: meetingType === 'poker' ? pokerUrl : meetingUrl
  } as const
  const summaryButton = {
    text: 'Review summary',
    url: summaryUrl
  } as const
  const blocks = [
    makeSections(['Meeting completed :tada:']),
    makeSections([`*Team:*\n${teamName}`, `*Meeting:*\n${meetingName}`]),
    makeSections([summaryText]),
    makeButtons([discussionButton, summaryButton])
  ]
  notifySlack('meetingEnd', dataLoader, teamId, blocks).catch(console.log)
}

const upsertSlackMessage = async (
  slackDetails: Unpromise<ReturnType<typeof getSlackDetails>>[0],
  blocks: string | Array<{type: string}>
) => {
  const {notification, auth} = slackDetails
  const {channelId} = notification
  const {botAccessToken} = auth
  if (!channelId) return
  const manager = new SlackServerManager(botAccessToken)
  const convoInfo = await manager.getConversationInfo(channelId)
  if (convoInfo.ok && 'latest' in convoInfo.channel) {
    const {channel} = convoInfo
    const {latest} = channel
    if (latest) {
      const {ts} = latest
      const timestamp = new Date(Number.parseFloat(ts) * 1000)
      const ageThresh = new Date(Date.now() - ms('5m'))
      if (timestamp >= ageThresh) {
        // blocks need to be stringified when updating but not posting
        const stringifiedBlocks = JSON.stringify(blocks)
        const res = await manager.updateMessage(channelId, stringifiedBlocks, ts)
        if (!res.ok) {
          console.error(res.error)
          const postRes = await manager.postMessage(channelId, blocks)
          if (!postRes.ok) console.error(postRes.error)
        }
        return
      }
    }
  } else {
    // handle error?
  }
  const res = await manager.postMessage(channelId, blocks)
  if (!res.ok) {
    console.error(res.error)
  }
}

export const notifySlackTimeLimitStart = async (
  scheduledEndTime: Date,
  meetingId: string,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const [team, meeting] = await Promise.all([
    dataLoader.get('teams').load(teamId),
    dataLoader.get('newMeetings').load(meetingId)
  ])
  const {name, phases, facilitatorStageId} = meeting
  const {name: teamName} = team
  // Slack fails with error message "invalid_arguments" if updating a block with a #
  // It can successfully post messages with a #
  const meetingName = name.replace('#', '')
  const stageRes = findStageById(phases, facilitatorStageId)
  const {stage} = stageRes!
  const meetingUrl = makeAppURL(appOrigin, `meet/${meetingId}`)
  const {phaseType} = stage
  const phaseLabel = phaseLabelLookup[phaseType]
  const slackDetails = await getSlackDetails('MEETING_STAGE_TIME_LIMIT_START', teamId, dataLoader)
  slackDetails.forEach(async (slackDetail) => {
    const fallbackDate = formatWeekday(scheduledEndTime)
    const fallbackTime = formatTime(scheduledEndTime)
    const fallbackZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Eastern Time'
    const fallback = `${fallbackDate} at ${fallbackTime} (${fallbackZone})`
    const constraint = `You have until *<!date^${toEpochSeconds(
      scheduledEndTime
    )}^{date_short_pretty} at {time}|${fallback}>* to complete it.`
    const button = {text: 'Open meeting', url: meetingUrl, type: 'primary'} as const
    const blocks = [
      makeSections([`The *${phaseLabel} Phase* has begun :hourglass_flowing_sand:`]),
      makeSections([`*Team:*\n${teamName}`, `*Meeting:*\n${meetingName}`]),
      makeSections([constraint]),
      makeSections([`*Link:*\n${meetingUrl}`]),
      makeButtons([button])
    ]
    upsertSlackMessage(slackDetail, blocks).catch(console.error)
  })
}

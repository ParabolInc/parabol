import ms from 'ms'
import {Unpromise} from '../../../../client/types/generics'
import formatTime from '../../../../client/utils/date/formatTime'
import formatWeekday from '../../../../client/utils/date/formatWeekday'
import findStageById from '../../../../client/utils/meetings/findStageById'
import {phaseLabelLookup} from '../../../../client/utils/meetings/lookups'
import getRethink from '../../../database/rethinkDriver'
import SlackNotification, {SlackNotificationEvent} from '../../../database/types/SlackNotification'
import {toEpochSeconds} from '../../../utils/epochTime'
import makeAppLink from '../../../utils/makeAppLink'
import sendToSentry from '../../../utils/sendToSentry'
import SlackServerManager from '../../../utils/SlackServerManager'
import {DataLoaderWorker} from '../../graphql'

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
  const userSlackAuths = await dataLoader.get('slackAuthByUserId').loadMany(notificationUserIds)
  return userSlackAuths.map((userSlackAuthArr, idx) => {
    const auth = userSlackAuthArr.find((val) => val.teamId === teamId)!
    return {auth, notification: distinctChannelNotifications[idx]}
  })
}

/* eslint-disable no-await-in-loop */
const notifySlack = async (
  event: SlackNotificationEvent,
  dataLoader: DataLoaderWorker,
  teamId: string,
  slackText: string
) => {
  const r = await getRethink()
  const slackDetails = await getSlackDetails(event, teamId, dataLoader)
  // for each slack channel, send a notification
  for (let i = 0; i < slackDetails.length; i++) {
    const {notification, auth} = slackDetails[i]
    const {channelId} = notification
    const {accessToken, botAccessToken} = auth
    const manager = new SlackServerManager(botAccessToken || accessToken)
    const res = await manager.postMessage(channelId!, slackText)

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
        console.log('Slack Channel Notification Error:', error)
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
  const team = await dataLoader.get('teams').load(teamId)
  const meetingUrl = makeAppLink(`meet/${meetingId}`)
  const slackText = `${team.name} has started a meeting!\n To join, click here: ${meetingUrl}`
  notifySlack('meetingStart', dataLoader, teamId, slackText).catch(console.log)
}

export const endSlackMeeting = async (meetingId, teamId, dataLoader: DataLoaderWorker) => {
  const team = await dataLoader.get('teams').load(teamId)
  const summaryUrl = makeAppLink(`new-summary/${meetingId}`)
  const slackText = `The meeting for ${team.name} has ended!\n Check out the summary here: ${summaryUrl}`
  notifySlack('meetingEnd', dataLoader, teamId, slackText).catch(console.log)
}

const upsertSlackMessage = async (
  slackDetails: Unpromise<ReturnType<typeof getSlackDetails>>[0],
  slackText: string
) => {
  const {notification, auth} = slackDetails
  const {channelId} = notification
  const {accessToken, botAccessToken} = auth
  if (!channelId) return
  const manager = new SlackServerManager(accessToken)
  const botManager = new SlackServerManager(botAccessToken)
  const channelInfo = await manager.getChannelInfo(channelId)
  if (channelInfo.ok) {
    const {channel} = channelInfo
    const {latest} = channel
    if (latest) {
      const {ts, username} = latest
      if (username === 'Parabol') {
        const timestamp = new Date(Number.parseFloat(ts) * 1000)
        const ageThresh = new Date(Date.now() - ms('5m'))
        if (timestamp >= ageThresh) {
          // trigger update
          const res = await botManager.updateMessage(channelId, slackText, ts)
          if (!res.ok) {
            console.error(res.error)
          }
          return
        }
      }
    }
  } else if (channelInfo.error === 'method_not_supported_for_channel_type') {
    // not a public channel, ignore
  } else {
    // handle error?
  }
  const res = await botManager.postMessage(channelId, slackText)
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
  const {name: meetingName, phases, facilitatorStageId} = meeting
  const stageRes = findStageById(phases, facilitatorStageId)
  const {stage} = stageRes!
  const meetingUrl = makeAppLink(`meet/${meetingId}`)
  const {phaseType} = stage
  const phaseLabel = phaseLabelLookup[phaseType]
  const slackDetails = await getSlackDetails('MEETING_STAGE_TIME_LIMIT_START', teamId, dataLoader)
  slackDetails.forEach(async (slackDetail) => {
    const fallbackDate = formatWeekday(scheduledEndTime)
    const fallbackTime = formatTime(scheduledEndTime)
    const fallbackZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Eastern Time'
    const fallback = `${fallbackDate} at ${fallbackTime} (${fallbackZone})`
    const situation = `The *${phaseLabel} Phase* for ${meetingName} on ${team.name} has begun!`
    const constraint = `You have until *<!date^${toEpochSeconds(
      scheduledEndTime
    )}^{date_short_pretty} at {time}|${fallback}>* to complete it.`
    const cta = `Check it out: ${meetingUrl}`
    const slackText = [situation, constraint, cta].join('\n')
    upsertSlackMessage(slackDetail, slackText).catch(console.error)
  })
}

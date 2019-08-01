import getRethink from '../../../database/rethinkDriver'
import makeAppLink from '../../../utils/makeAppLink'
import {
  meetingTypeToLabel,
  meetingTypeToSlug,
  phaseLabelLookup
} from '../../../../client/utils/meetings/lookups'
import {MeetingType} from '../../../database/types/Meeting'
import {DataLoaderWorker} from '../../graphql'
import SlackNotification, {SlackNotificationEvent} from '../../../database/types/SlackNotification'
import SlackManager from '../../../utils/SlackManager'
import findStageById from '../../../../client/utils/meetings/findStageById'
import {Unpromise} from '../../../../client/types/generics'
import ms from 'ms'
import formatTime from '../../../../client/utils/date/formatTime'
import formatWeekday from '../../../../client/utils/date/formatWeekday'

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
  const r = getRethink()
  const slackDetails = await getSlackDetails(event, teamId, dataLoader)
  // for each slack channel, send a notification
  for (let i = 0; i < slackDetails.length; i++) {
    const {notification, auth} = slackDetails[i]
    const {channelId} = notification
    const {accessToken, botAccessToken} = auth
    const manager = new SlackManager(botAccessToken || accessToken)
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
      } else if (error === 'not_in_channel' || error === 'invalid_auth') {
        console.log('Slack Channel Notification Error:', error)
      }
    }
  }
}

export const startSlackMeeting = async (
  teamId: string,
  dataLoader: DataLoaderWorker,
  meetingType: MeetingType
) => {
  const team = await dataLoader.get('teams').load(teamId)
  const meetingSlug = meetingTypeToSlug[meetingType]
  const meetingUrl = makeAppLink(`${meetingSlug}/${teamId}`)
  const slackText = `${team.name} has started a meeting!\n To join, click here: ${meetingUrl}`
  notifySlack('meetingStart', dataLoader, teamId, slackText).catch(console.log)
}

export const endSlackMeeting = async (meetingId, teamId, dataLoader: DataLoaderWorker) => {
  const team = await dataLoader.get('teams').load(teamId)
  const summaryUrl = makeAppLink(`new-summary/${meetingId}`)
  const slackText = `The meeting for ${
    team.name
  } has ended!\n Check out the summary here: ${summaryUrl}`
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
  const manager = new SlackManager(accessToken)
  const botManager = new SlackManager(botAccessToken)
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
  const {meetingType, phases, facilitatorStageId} = meeting
  const stageRes = findStageById(phases, facilitatorStageId)
  const {stage} = stageRes!
  const slug = meetingTypeToSlug[meetingType]
  const meetingUrl = makeAppLink(`${slug}/${teamId}`)
  const meetingLabel = meetingTypeToLabel[meetingType]
  const {phaseType} = stage
  const date = formatWeekday(scheduledEndTime)
  const time = formatTime(scheduledEndTime)
  const phaseLabel = phaseLabelLookup[phaseType]
  const slackText = `The ${phaseLabel} phase for your ${meetingLabel} meeting on ${
    team.name
  } has begun! You have until ${time} on ${date} to complete it. Check it out: ${meetingUrl}`
  const slackDetails = await getSlackDetails('MEETING_STAGE_TIME_LIMIT_START', teamId, dataLoader)
  slackDetails.forEach((slackDetail) => {
    upsertSlackMessage(slackDetail, slackText).catch(console.error)
  })
}

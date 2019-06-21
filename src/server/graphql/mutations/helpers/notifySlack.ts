import getRethink from 'server/database/rethinkDriver'
import makeAppLink from 'server/utils/makeAppLink'
import {meetingTypeToLabel, meetingTypeToSlug} from 'universal/utils/meetings/lookups'
import {MeetingType} from 'server/database/types/Meeting'
import {DataLoaderWorker} from 'server/graphql/graphql'
import SlackNotification, {SlackNotificationEvent} from 'server/database/types/SlackNotification'
import SlackManager from 'server/utils/SlackManager'
import {days, shortMonths} from 'universal/utils/makeDateString'
import findStageById from 'universal/utils/meetings/findStageById'
import {Unpromise} from 'types/generics'
import ms from 'ms'

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

const formatDay = (ts: Date) => {
  const month = ts.getMonth()
  const date = ts.getDate()
  const monthStr = shortMonths[month]
  const weekDay = days[ts.getDay()]
  return `${weekDay}, ${monthStr} ${date}`
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
          botManager.updateMessage(channelId, slackText, ts).catch(console.error)
          return
        }
      }
    }
  } else if (channelInfo.error === 'method_not_supported_for_channel_type') {
    // not a public channel, ignore
  } else {
    // handle error?
  }
  botManager.postMessage(channelId, slackText).catch(console.error)
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
  const slackText = `The ${phaseType} stage for your ${meetingLabel} meeting on ${
    team.name
  } has begun! You have until ${formatDay(
    scheduledEndTime
  )} to complete it. Check it out: ${meetingUrl}`
  const slackDetails = await getSlackDetails('MEETING_STAGE_TIME_LIMIT_START', teamId, dataLoader)
  slackDetails.forEach((slackDetail) => {
    upsertSlackMessage(slackDetail, slackText).catch(console.error)
  })
}

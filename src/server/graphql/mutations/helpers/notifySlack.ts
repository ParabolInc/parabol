import getRethink from 'server/database/rethinkDriver'
import makeAppLink from 'server/utils/makeAppLink'
import {meetingTypeToSlug} from 'universal/utils/meetings/lookups'
import {MeetingType} from 'server/database/types/Meeting'
import {DataLoaderWorker} from 'server/graphql/graphql'
import SlackNotification, {SlackNotificationEvent} from 'server/database/types/SlackNotification'
import SlackManager from 'server/utils/SlackManager'

const getDistinctChannelNotifications = async (
  event: SlackNotificationEvent,
  dataLoader: DataLoaderWorker,
  teamId: string
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
  return distinctChannelNotifications
}

/* eslint-disable no-await-in-loop */
const notifySlack = async (
  event: SlackNotificationEvent,
  dataLoader: DataLoaderWorker,
  teamId: string,
  slackText: string
) => {
  const r = getRethink()
  const distinctNotifications = await getDistinctChannelNotifications(event, dataLoader, teamId)
  const notificationUserIds = distinctNotifications.map(({userId}) => userId)
  const userSlackAuths = await dataLoader.get('slackAuthByUserId').loadMany(notificationUserIds)
  const slackAuths = userSlackAuths.map((userSlackAuthArr) =>
    userSlackAuthArr.find((val) => val.teamId === teamId)
  )
  // for each slack channel, send a notification
  for (let i = 0; i < distinctNotifications.length; i++) {
    const notification = distinctNotifications[i]
    const auth = slackAuths[i]
    if (!auth) continue
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

import formatTime from 'parabol-client/utils/date/formatTime'
import formatWeekday from 'parabol-client/utils/date/formatWeekday'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import {phaseLabelLookup} from 'parabol-client/utils/meetings/lookups'
import appOrigin from '../../../../appOrigin'
import getRethink from '../../../../database/rethinkDriver'
import Meeting from '../../../../database/types/Meeting'
import {SlackNotificationEvent} from '../../../../database/types/SlackNotification'
import {SlackNotificationAuth} from '../../../../dataloader/integrationAuthLoaders'
import {Team} from '../../../../postgres/queries/getTeamsByIds'
import {MeetingTypeEnum} from '../../../../postgres/types/Meeting'
import {toEpochSeconds} from '../../../../utils/epochTime'
import segmentIo from '../../../../utils/segmentIo'
import sendToSentry from '../../../../utils/sendToSentry'
import SlackServerManager from '../../../../utils/SlackServerManager'
import {DataLoaderWorker} from '../../../graphql'
import getSummaryText from './getSummaryText'
import {makeButtons, makeSection, makeSections} from './makeSlackBlocks'
import {NotificationIntegrationHelper, NotifyResponse} from './NotificationIntegrationHelper'
import {Notifier} from './Notifier'

type SlackNotification = {
  title: string
  blocks: string | Array<{type: string}>
}

const notifySlack = async (
  notificationChannel: SlackNotificationAuth,
  event: SlackNotificationEvent,
  teamId: string,
  slackMessage: string | Array<{type: string}>,
  notificationText?: string
): Promise<NotifyResponse> => {
  const {channelId, auth} = notificationChannel
  const {botAccessToken, userId} = auth
  const manager = new SlackServerManager(botAccessToken!)
  const res = await manager.postMessage(channelId!, slackMessage, notificationText)
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

    return notifySlack(notificationChannel, 'meetingStart', team.id, blocks, title)
  },

  async endMeeting(meeting, team) {
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
    return notifySlack(notificationChannel, 'meetingEnd', team.id, blocks, title)
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
    return notifySlack(
      notificationChannel,
      'MEETING_STAGE_TIME_LIMIT_START',
      team.id,
      blocks,
      title
    )
  },

  async endTimeLimit(meeting, team) {
    const meetingUrl = makeAppURL(appOrigin, `meet/${meeting.id}`)
    // TODO now is a good time to make the message nice with the `meetingName`
    const slackText = `Time’s up! Advance your meeting to the next phase: ${meetingUrl}`
    return notifySlack(notificationChannel, 'MEETING_STAGE_TIME_LIMIT_END', team.id, slackText)
  },

  async integrationUpdated() {
    // Slack sends a system message on its own
    return 'success'
  }
})

async function getSlack(
  dataLoader: DataLoaderWorker,
  event: SlackNotificationEvent,
  teamId: string
) {
  const notifications = await dataLoader
    .get('slackNotificationsByTeamIdAndEvent')
    .load({event, teamId})
  return notifications.map(SlackSingleChannelNotifier)
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

export const SlackNotifier: Notifier = {
  async startMeeting(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    const notifiers = await getSlack(dataLoader, 'meetingStart', team.id)
    notifiers.forEach((notifier) => notifier.startMeeting(meeting, team))
  },

  async endMeeting(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    const notifiers = await getSlack(dataLoader, 'meetingEnd', team.id)
    notifiers.forEach((notifier) => notifier.endMeeting(meeting, team))
  },

  async startTimeLimit(
    dataLoader: DataLoaderWorker,
    scheduledEndTime: Date,
    meetingId: string,
    teamId: string
  ) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    const notifiers = await getSlack(dataLoader, 'MEETING_STAGE_TIME_LIMIT_START', team.id)
    notifiers.forEach((notifier) => notifier.startTimeLimit(scheduledEndTime, meeting, team))
  },

  async endTimeLimit(dataLoader: DataLoaderWorker, meetingId: string, teamId: string) {
    const {meeting, team} = await loadMeetingTeam(dataLoader, meetingId, teamId)
    if (!meeting || !team) return
    const notifiers = await getSlack(dataLoader, 'MEETING_STAGE_TIME_LIMIT_END', team.id)
    notifiers.forEach((notifier) => notifier.endTimeLimit(meeting, team))
  },

  async integrationUpdated() {
    // Slack sends a system message on its own
  },

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
    const [user, team, meeting, reflectionGroup, reflections, slackAuth] = await Promise.all([
      dataLoader.get('users').load(userId),
      dataLoader.get('teams').load(teamId),
      dataLoader.get('newMeetings').load(meetingId),
      dataLoader.get('retroReflectionGroups').load(reflectionGroupId),
      r.table('RetroReflection').getAll(reflectionGroupId, {index: 'reflectionGroupId'}).run(),
      r.table('SlackAuth').getAll(userId, {index: 'userId'}).filter({teamId})(0).run()
    ])

    if (!user) {
      throw new Error('User not found')
    }

    if (!team) {
      throw new Error('Team not found')
    }

    if (!slackAuth) {
      throw new Error('Slack auth not found')
    }

    const {botAccessToken, slackUserId} = slackAuth
    const manager = new SlackServerManager(botAccessToken!)
    const channelInfo = await manager.getConversationInfo(channelId)

    if (channelId !== slackUserId) {
      if (!channelInfo.ok) {
        throw new Error(channelInfo.error)
      }
      const {channel} = channelInfo
      const {id: channelId, is_member: isMember, is_archived: isArchived} = channel
      if (isArchived) {
        throw new Error('Slack channel archived')
      }
      if (!isMember) {
        const joinConvoRes = await manager.joinConversation(channelId)
        if (!joinConvoRes.ok) {
          throw new Error('Unable to join slack channel')
        }
      }
    }

    const topic = reflectionGroup.title
    const discussionUrl = makeAppURL(appOrigin, `meet/${meetingId}/discuss/${stageIndex + 1}`)
    const meetingUrl = makeAppURL(appOrigin, `meet/${meetingId}`)

    const reflectionsText = reflections
      .map((reflection) => `• ${reflection.plaintextContent}`)
      .join('\n')

    const slackBlocks = [
      makeSection(
        `<@${slackAuth.slackUserId}> has shared reflections about *"${topic}"* from their retrospective`
      ),
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Team:*\n${team.name}`
          },
          {
            type: 'mrkdwn',
            text: `*Meeting:*\n<${meetingUrl}|${meeting.name}>`
          }
        ]
      },
      makeSection(`*Topic:*\n<${discussionUrl}|${topic}>`)
    ]

    if (reflectionGroup.summary) {
      const test = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sodales nec dolor eu egestas. Aenean nec dictum leo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sed tincidunt purus. Cras eget vestibulum sem, eu ultrices ante. Proin tempor ligula urna, eu sollicitudin dolor viverra non. In nec lobortis tortor. Mauris vehicula sed nibh vel tempus. Duis porttitor libero eu nulla tempus, ut mollis magna ultrices. Nullam massa tortor, molestie at consectetur quis, dictum dignissim nibh.

Curabitur facilisis, quam vitae auctor viverra, turpis libero cursus diam, ac venenatis erat quam quis nisl. Morbi in facilisis odio, et sodales orci. Vestibulum accumsan laoreet justo, quis lobortis sem convallis at. Proin at urna sapien. Fusce mollis aliquam sapien, id iaculis nisl sodales vel. Phasellus odio elit, molestie ut rhoncus sed, tempor quis nisi. Aenean at sapien ac ipsum commodo ullamcorper eu id ante. Donec at leo sed arcu dignissim lacinia non ac neque. Maecenas faucibus diam vitae lectus ultrices dignissim. Duis commodo ac metus at egestas. Cras erat urna, rhoncus at tellus sed, viverra viverra ipsum. Morbi nec nisi facilisis, eleifend risus eu, sagittis est. In tincidunt mollis dui a interdum. Sed sit amet felis sit amet magna ultricies aliquam egestas a eros. Integer erat lectus, cursus a lorem ut, congue maximus ex. Donec consectetur magna metus, non placerat eros sodales non.

Nunc gravida tellus tortor, at pretium est ultricies eget. Nunc accumsan leo at finibus suscipit. Ut sed vestibulum ante. Aliquam erat volutpat. Praesent vel diam ante. In eu leo accumsan, tincidunt nulla vel, ultrices sem. Morbi mattis est tellus, at dapibus tellus tincidunt sit amet. Praesent iaculis aliquet est, et finibus est placerat a. Suspendisse finibus sit amet arcu eu posuere. Nullam ullamcorper rhoncus nunc, non tempor nisl ornare et. Maecenas vestibulum consectetur leo sit amet egestas.

Sed laoreet lorem vitae velit dignissim, vel luctus tellus aliquet. Mauris vulputate mauris in nibh iaculis, a scelerisque nunc pharetra. Cras laoreet, nulla et consectetur elementum, lectus ipsum interdum odio, sit amet faucibus elit nisl sit amet urna. Pellentesque vel iaculis justo, et viverra ipsum. Sed tempus maximus est, vitae egestas est commodo eu. Nulla at molestie libero. Donec eu urna rhoncus, viverra lacus ac, aliquet risus. In hac habitasse platea dictumst.

Cras laoreet, felis id bibendum tincidunt, nulla justo aliquam ex, id fringilla augue libero eu nibh. Cras nec neque sed tortor porta dignissim. Cras tempus a nisi quis feugiat. Curabitur ut feugiat nisi. Aliquam sed ex sed ante rutrum volutpat congue vel justo. Suspendisse mollis urna vel lacus ornare fermentum. Proin vestibulum tempor malesuada. Proin elementum vel libero sit amet ultrices. Sed semper justo sit amet urna lobortis faucibus. In molestie pellentesque eros vel rhoncus. Sed ut iaculis ligula. Quisque enim velit, porta a turpis a, lacinia convallis tortor.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sodales nec dolor eu egestas. Aenean nec dictum leo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sed tincidunt purus. Cras eget vestibulum sem, eu ultrices ante. Proin tempor ligula urna, eu sollicitudin dolor viverra non. In nec lobortis tortor. Mauris vehicula sed nibh vel tempus. Duis porttitor libero eu nulla tempus, ut mollis magna ultrices. Nullam massa tortor, molestie at consectetur quis, dictum dignissim nibh.

Curabitur facilisis, quam vitae auctor viverra, turpis libero cursus diam, ac venenatis erat quam quis nisl. Morbi in facilisis odio, et sodales orci. Vestibulum accumsan laoreet justo, quis lobortis sem convallis at. Proin at urna sapien. Fusce mollis aliquam sapien, id iaculis nisl sodales vel. Phasellus odio elit, molestie ut rhoncus sed, tempor quis nisi. Aenean at sapien ac ipsum commodo ullamcorper eu id ante. Donec at leo sed arcu dignissim lacinia non ac neque. Maecenas faucibus diam vitae lectus ultrices dignissim. Duis commodo ac metus at egestas. Cras erat urna, rhoncus at tellus sed, viverra viverra ipsum. Morbi nec nisi facilisis, eleifend risus eu, sagittis est. In tincidunt mollis dui a interdum. Sed sit amet felis sit amet magna ultricies aliquam egestas a eros. Integer erat lectus, cursus a lorem ut, congue maximus ex. Donec consectetur magna metus, non placerat eros sodales non.

Nunc gravida tellus tortor, at pretium est ultricies eget. Nunc accumsan leo at finibus suscipit. Ut sed vestibulum ante. Aliquam erat volutpat. Praesent vel diam ante. In eu leo accumsan, tincidunt nulla vel, ultrices sem. Morbi mattis est tellus, at dapibus tellus tincidunt sit amet. Praesent iaculis aliquet est, et finibus est placerat a. Suspendisse finibus sit amet arcu eu posuere. Nullam ullamcorper rhoncus nunc, non tempor nisl ornare et. Maecenas vestibulum consectetur leo sit amet egestas.

Sed laoreet lorem vitae velit dignissim, vel luctus tellus aliquet. Mauris vulputate mauris in nibh iaculis, a scelerisque nunc pharetra. Cras laoreet, nulla et consectetur elementum, lectus ipsum interdum odio, sit amet faucibus elit nisl sit amet urna. Pellentesque vel iaculis justo, et viverra ipsum. Sed tempus maximus est, vitae egestas est commodo eu. Nulla at molestie libero. Donec eu urna rhoncus, viverra lacus ac, aliquet risus. In hac habitasse platea dictumst.

Cras laoreet, felis id bibendum tincidunt, nulla justo aliquam ex, id fringilla augue libero eu nibh. Cras nec neque sed tortor porta dignissim. Cras tempus a nisi quis feugiat. Curabitur ut feugiat nisi. Aliquam sed ex sed ante rutrum volutpat congue vel justo. Suspendisse mollis urna vel lacus ornare fermentum. Proin vestibulum tempor malesuada. Proin elementum vel libero sit amet ultrices. Sed semper justo sit amet urna lobortis faucibus. In molestie pellentesque eros vel rhoncus. Sed ut iaculis ligula. Quisque enim velit, porta a turpis a, lacinia convallis tortor.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sodales nec dolor eu egestas. Aenean nec dictum leo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sed tincidunt purus. Cras eget vestibulum sem, eu ultrices ante. Proin tempor ligula urna, eu sollicitudin dolor viverra non. In nec lobortis tortor. Mauris vehicula sed nibh vel tempus. Duis porttitor libero eu nulla tempus, ut mollis magna ultrices. Nullam massa tortor, molestie at consectetur quis, dictum dignissim nibh.

Curabitur facilisis, quam vitae auctor viverra, turpis libero cursus diam, ac venenatis erat quam quis nisl. Morbi in facilisis odio, et sodales orci. Vestibulum accumsan laoreet justo, quis lobortis sem convallis at. Proin at urna sapien. Fusce mollis aliquam sapien, id iaculis nisl sodales vel. Phasellus odio elit, molestie ut rhoncus sed, tempor quis nisi. Aenean at sapien ac ipsum commodo ullamcorper eu id ante. Donec at leo sed arcu dignissim lacinia non ac neque. Maecenas faucibus diam vitae lectus ultrices dignissim. Duis commodo ac metus at egestas. Cras erat urna, rhoncus at tellus sed, viverra viverra ipsum. Morbi nec nisi facilisis, eleifend risus eu, sagittis est. In tincidunt mollis dui a interdum. Sed sit amet felis sit amet magna ultricies aliquam egestas a eros. Integer erat lectus, cursus a lorem ut, congue maximus ex. Donec consectetur magna metus, non placerat eros sodales non.

Nunc gravida tellus tortor, at pretium est ultricies eget. Nunc accumsan leo at finibus suscipit. Ut sed vestibulum ante. Aliquam erat volutpat. Praesent vel diam ante. In eu leo accumsan, tincidunt nulla vel, ultrices sem. Morbi mattis est tellus, at dapibus tellus tincidunt sit amet. Praesent iaculis aliquet est, et finibus est placerat a. Suspendisse finibus sit amet arcu eu posuere. Nullam ullamcorper rhoncus nunc, non tempor nisl ornare et. Maecenas vestibulum consectetur leo sit amet egestas.

Sed laoreet lorem vitae velit dignissim, vel luctus tellus aliquet. Mauris vulputate mauris in nibh iaculis, a scelerisque nunc pharetra. Cras laoreet, nulla et consectetur elementum, lectus ipsum interdum odio, sit amet faucibus elit nisl sit amet urna. Pellentesque vel iaculis justo, et viverra ipsum. Sed tempus maximus est, vitae egestas est commodo eu. Nulla at molestie libero. Donec eu urna rhoncus, viverra lacus ac, aliquet risus. In hac habitasse platea dictumst.

Cras laoreet, felis id bibendum tincidunt, nulla justo aliquam ex, id fringilla augue libero eu nibh. Cras nec neque sed tortor porta dignissim. Cras tempus a nisi quis feugiat. Curabitur ut feugiat nisi. Aliquam sed ex sed ante rutrum volutpat congue vel justo. Suspendisse mollis urna vel lacus ornare fermentum. Proin vestibulum tempor malesuada. Proin elementum vel libero sit amet ultrices. Sed semper justo sit amet urna lobortis faucibus. In molestie pellentesque eros vel rhoncus. Sed ut iaculis ligula. Quisque enim velit, porta a turpis a, lacinia convallis tortor.


Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sodales nec dolor eu egestas. Aenean nec dictum leo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sed tincidunt purus. Cras eget vestibulum sem, eu ultrices ante. Proin tempor ligula urna, eu sollicitudin dolor viverra non. In nec lobortis tortor. Mauris vehicula sed nibh vel tempus. Duis porttitor libero eu nulla tempus, ut mollis magna ultrices. Nullam massa tortor, molestie at consectetur quis, dictum dignissim nibh.

Curabitur facilisis, quam vitae auctor viverra, turpis libero cursus diam, ac venenatis erat quam quis nisl. Morbi in facilisis odio, et sodales orci. Vestibulum accumsan laoreet justo, quis lobortis sem convallis at. Proin at urna sapien. Fusce mollis aliquam sapien, id iaculis nisl sodales vel. Phasellus odio elit, molestie ut rhoncus sed, tempor quis nisi. Aenean at sapien ac ipsum commodo ullamcorper eu id ante. Donec at leo sed arcu dignissim lacinia non ac neque. Maecenas faucibus diam vitae lectus ultrices dignissim. Duis commodo ac metus at egestas. Cras erat urna, rhoncus at tellus sed, viverra viverra ipsum. Morbi nec nisi facilisis, eleifend risus eu, sagittis est. In tincidunt mollis dui a interdum. Sed sit amet felis sit amet magna ultricies aliquam egestas a eros. Integer erat lectus, cursus a lorem ut, congue maximus ex. Donec consectetur magna metus, non placerat eros sodales non.

Nunc gravida tellus tortor, at pretium est ultricies eget. Nunc accumsan leo at finibus suscipit. Ut sed vestibulum ante. Aliquam erat volutpat. Praesent vel diam ante. In eu leo accumsan, tincidunt nulla vel, ultrices sem. Morbi mattis est tellus, at dapibus tellus tincidunt sit amet. Praesent iaculis aliquet est, et finibus est placerat a. Suspendisse finibus sit amet arcu eu posuere. Nullam ullamcorper rhoncus nunc, non tempor nisl ornare et. Maecenas vestibulum consectetur leo sit amet egestas.

Sed laoreet lorem vitae velit dignissim, vel luctus tellus aliquet. Mauris vulputate mauris in nibh iaculis, a scelerisque nunc pharetra. Cras laoreet, nulla et consectetur elementum, lectus ipsum interdum odio, sit amet faucibus elit nisl sit amet urna. Pellentesque vel iaculis justo, et viverra ipsum. Sed tempus maximus est, vitae egestas est commodo eu. Nulla at molestie libero. Donec eu urna rhoncus, viverra lacus ac, aliquet risus. In hac habitasse platea dictumst.

Cras laoreet, felis id bibendum tincidunt, nulla justo aliquam ex, id fringilla augue libero eu nibh. Cras nec neque sed tortor porta dignissim. Cras tempus a nisi quis feugiat. Curabitur ut feugiat nisi. Aliquam sed ex sed ante rutrum volutpat congue vel justo. Suspendisse mollis urna vel lacus ornare fermentum. Proin vestibulum tempor malesuada. Proin elementum vel libero sit amet ultrices. Sed semper justo sit amet urna lobortis faucibus. In molestie pellentesque eros vel rhoncus. Sed ut iaculis ligula. Quisque enim velit, porta a turpis a, lacinia convallis tortor.


Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sodales nec dolor eu egestas. Aenean nec dictum leo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sed tincidunt purus. Cras eget vestibulum sem, eu ultrices ante. Proin tempor ligula urna, eu sollicitudin dolor viverra non. In nec lobortis tortor. Mauris vehicula sed nibh vel tempus. Duis porttitor libero eu nulla tempus, ut mollis magna ultrices. Nullam massa tortor, molestie at consectetur quis, dictum dignissim nibh.

Curabitur facilisis, quam vitae auctor viverra, turpis libero cursus diam, ac venenatis erat quam quis nisl. Morbi in facilisis odio, et sodales orci. Vestibulum accumsan laoreet justo, quis lobortis sem convallis at. Proin at urna sapien. Fusce mollis aliquam sapien, id iaculis nisl sodales vel. Phasellus odio elit, molestie ut rhoncus sed, tempor quis nisi. Aenean at sapien ac ipsum commodo ullamcorper eu id ante. Donec at leo sed arcu dignissim lacinia non ac neque. Maecenas faucibus diam vitae lectus ultrices dignissim. Duis commodo ac metus at egestas. Cras erat urna, rhoncus at tellus sed, viverra viverra ipsum. Morbi nec nisi facilisis, eleifend risus eu, sagittis est. In tincidunt mollis dui a interdum. Sed sit amet felis sit amet magna ultricies aliquam egestas a eros. Integer erat lectus, cursus a lorem ut, congue maximus ex. Donec consectetur magna metus, non placerat eros sodales non.

Nunc gravida tellus tortor, at pretium est ultricies eget. Nunc accumsan leo at finibus suscipit. Ut sed vestibulum ante. Aliquam erat volutpat. Praesent vel diam ante. In eu leo accumsan, tincidunt nulla vel, ultrices sem. Morbi mattis est tellus, at dapibus tellus tincidunt sit amet. Praesent iaculis aliquet est, et finibus est placerat a. Suspendisse finibus sit amet arcu eu posuere. Nullam ullamcorper rhoncus nunc, non tempor nisl ornare et. Maecenas vestibulum consectetur leo sit amet egestas.

Sed laoreet lorem vitae velit dignissim, vel luctus tellus aliquet. Mauris vulputate mauris in nibh iaculis, a scelerisque nunc pharetra. Cras laoreet, nulla et consectetur elementum, lectus ipsum interdum odio, sit amet faucibus elit nisl sit amet urna. Pellentesque vel iaculis justo, et viverra ipsum. Sed tempus maximus est, vitae egestas est commodo eu. Nulla at molestie libero. Donec eu urna rhoncus, viverra lacus ac, aliquet risus. In hac habitasse platea dictumst.

Cras laoreet, felis id bibendum tincidunt, nulla justo aliquam ex, id fringilla augue libero eu nibh. Cras nec neque sed tortor porta dignissim. Cras tempus a nisi quis feugiat. Curabitur ut feugiat nisi. Aliquam sed ex sed ante rutrum volutpat congue vel justo. Suspendisse mollis urna vel lacus ornare fermentum. Proin vestibulum tempor malesuada. Proin elementum vel libero sit amet ultrices. Sed semper justo sit amet urna lobortis faucibus. In molestie pellentesque eros vel rhoncus. Sed ut iaculis ligula. Quisque enim velit, porta a turpis a, lacinia convallis tortor.

`
      slackBlocks.push(makeSection(`*Summary:*\n${test}`))
    }

    slackBlocks.push(makeSection(`*Reflections:* \n${reflectionsText}`))

    const notificationChannel = {
      id: '',
      channelId,
      userId,
      teamId,
      event: 'TOPIC_SHARED' as const,
      auth: slackAuth
    }

    return notifySlack(notificationChannel, 'TOPIC_SHARED', team.id, slackBlocks)
  }
}

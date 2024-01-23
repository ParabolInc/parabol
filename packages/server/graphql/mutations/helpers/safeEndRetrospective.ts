import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {DISCUSS, PARABOL_AI_USER_ID} from 'parabol-client/utils/constants'
import getMeetingPhase from 'parabol-client/utils/getMeetingPhase'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import {RawDraftContentState} from 'draft-js'
import {checkTeamsLimit} from '../../../billing/helpers/teamLimitsCheck'
import getRethink from '../../../database/rethinkDriver'
import {RDatum} from '../../../database/stricterR'
import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import TimelineEventRetroComplete from '../../../database/types/TimelineEventRetroComplete'
import getKysely from '../../../postgres/getKysely'
import removeSuggestedAction from '../../../safeMutations/removeSuggestedAction'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import publishNotification from '../../public/mutations/helpers/publishNotification'
import RecallAIServerManager from '../../../utils/RecallAIServerManager'
import sendToSentry from '../../../utils/sendToSentry'
import standardError from '../../../utils/standardError'
import {InternalContext} from '../../graphql'
import updateTeamInsights from './updateTeamInsights'
import sendNewMeetingSummary from './endMeeting/sendNewMeetingSummary'
import generateWholeMeetingSentimentScore from './generateWholeMeetingSentimentScore'
import generateWholeMeetingSummary from './generateWholeMeetingSummary'
import handleCompletedStage from './handleCompletedStage'
import {IntegrationNotifier} from './notifications/IntegrationNotifier'
import removeEmptyTasks from './removeEmptyTasks'
import updateQualAIMeetingsCount from './updateQualAIMeetingsCount'
import gatherInsights from './gatherInsights'
import NotificationMentioned from '../../../database/types/NotificationMentioned'

const getTranscription = async (recallBotId?: string | null) => {
  if (!recallBotId) return
  const manager = new RecallAIServerManager()
  return await manager.getBotTranscript(recallBotId)
}

const sendKudos = async (
  meeting: MeetingRetrospective,
  teamId: string,
  context: InternalContext
) => {
  const {dataLoader, socketId: mutatorId} = context
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const {id: meetingId, disableAnonymity} = meeting
  const isAnonymous = !disableAnonymity
  const pg = getKysely()
  const r = await getRethink()

  const [reflections, team, meetingMembers] = await Promise.all([
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('meetingMembersByMeetingId').load(meetingId)
  ])

  const {phases} = meeting
  const discussPhase = getPhase(phases, 'discuss')
  const {stages} = discussPhase

  const {giveKudosWithEmoji, kudosEmojiUnicode, kudosEmoji} = team

  if (!giveKudosWithEmoji || !kudosEmojiUnicode) {
    return
  }

  const kudosToInsert: {
    senderUserId: string
    receiverUserId: any
    teamId: string
    emoji: string
    emojiUnicode: string
    isAnonymous: boolean
    reflectionId: string
  }[] = []

  const notificationsToInsert: NotificationMentioned[] = []

  for (const reflection of reflections) {
    const {id: reflectionId, content, plaintextContent, creatorId} = reflection
    const senderUser = await dataLoader.get('users').loadNonNull(creatorId)

    const contentJson = JSON.parse(content) as RawDraftContentState

    const mentions = contentJson.entityMap
      ? Object.values(contentJson.entityMap).filter((entity) => entity.type === 'MENTION')
      : []

    if (mentions.length) {
      const userIds = [...new Set(mentions.map((mention) => mention.data.userId))].filter(
        (userId) => userId !== creatorId
      )

      if (userIds.length) {
        const retroDiscussStageIdx =
          stages.findIndex((stage) => stage.reflectionGroupId === reflection.reflectionGroupId) + 1

        if (plaintextContent.includes(kudosEmojiUnicode)) {
          userIds.forEach((userId) => {
            kudosToInsert.push({
              senderUserId: creatorId,
              receiverUserId: userId,
              teamId,
              emoji: kudosEmoji,
              emojiUnicode: kudosEmojiUnicode,
              isAnonymous,
              reflectionId
            })
            notificationsToInsert.push(
              new NotificationMentioned({
                userId,
                senderUserId: creatorId,
                meetingId,
                retroDiscussStageIdx,
                retroReflectionId: reflectionId,
                kudosEmoji: team.kudosEmoji,
                kudosEmojiUnicode: team.kudosEmojiUnicode,
                meetingName: meeting.name,
                name: isAnonymous ? null : senderUser.preferredName,
                picture: isAnonymous ? null : senderUser.picture
              })
            )
          })
        } else {
          const absentUserIds = userIds.filter(
            (userId) => !meetingMembers.find((member) => member.userId === userId)
          )

          absentUserIds.forEach((userId) => {
            notificationsToInsert.push(
              new NotificationMentioned({
                userId,
                senderUserId: creatorId,
                meetingId,
                retroDiscussStageIdx,
                retroReflectionId: reflectionId,
                meetingName: meeting.name,
                name: isAnonymous ? null : senderUser.preferredName,
                picture: isAnonymous ? null : senderUser.picture
              })
            )
          })
        }
      }
    }
  }

  if (kudosToInsert.length) {
    const insertedKudoses = await pg
      .insertInto('Kudos')
      .values(kudosToInsert)
      .returning(['id', 'senderUserId', 'receiverUserId', 'emoji', 'emojiUnicode'])
      .execute()

    insertedKudoses.forEach((kudos) => {
      analytics.kudosSent(
        {id: kudos.senderUserId},
        teamId,
        kudos.id,
        kudos.receiverUserId,
        'mention',
        'retrospective',
        isAnonymous
      )
    })
  }

  if (notificationsToInsert.length) {
    await r.table('Notification').insert(notificationsToInsert).run()
    notificationsToInsert.forEach((notification) => {
      publishNotification(notification, subOptions)
    })
  }
}

const summarizeRetroMeeting = async (meeting: MeetingRetrospective, context: InternalContext) => {
  const {dataLoader, authToken} = context
  const {id: meetingId, phases, facilitatorUserId, teamId, recallBotId} = meeting
  const r = await getRethink()
  const [reflectionGroups, reflections, sentimentScore] = await Promise.all([
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    generateWholeMeetingSentimentScore(meetingId, facilitatorUserId, dataLoader)
  ])
  const discussPhase = getPhase(phases, 'discuss')
  const {stages} = discussPhase
  const discussionIds = stages.map((stage) => stage.discussionId)

  const reflectionGroupIds = reflectionGroups.map(({id}) => id)
  const hasTopicSummary = reflectionGroups.some((group) => group.summary)
  if (hasTopicSummary) {
    const groupsWithMissingTopicSummaries = reflectionGroups.filter((group) => {
      const reflectionsInGroup = reflections.filter(
        (reflection) => reflection.reflectionGroupId === group.id
      )
      return reflectionsInGroup.length > 1 && !group.summary
    })
    if (groupsWithMissingTopicSummaries.length > 0) {
      const missingGroupIds = groupsWithMissingTopicSummaries.map(({id}) => id).join(', ')
      const error = new Error('Missing AI topic summary')
      const viewerId = getUserId(authToken)
      sendToSentry(error, {
        userId: viewerId,
        tags: {missingGroupIds, meetingId}
      })
    }
  }
  const [summary, transcription] = await Promise.all([
    generateWholeMeetingSummary(discussionIds, meetingId, teamId, facilitatorUserId, dataLoader),
    getTranscription(recallBotId)
  ])

  await r
    .table('NewMeeting')
    .get(meetingId)
    .update(
      {
        commentCount: r
          .table('Comment')
          .getAll(r.args(discussionIds), {index: 'discussionId'})
          .filter((row: RDatum) =>
            row('isActive').eq(true).and(row('createdBy').ne(PARABOL_AI_USER_ID))
          )
          .count()
          .default(0) as unknown as number,
        taskCount: r
          .table('Task')
          .getAll(r.args(discussionIds), {index: 'discussionId'})
          .count()
          .default(0) as unknown as number,
        topicCount: reflectionGroupIds.length,
        reflectionCount: reflections.length,
        sentimentScore,
        summary,
        transcription
      },
      {nonAtomic: true}
    )
    .run()

  dataLoader.get('newMeetings').clear(meetingId)
  // wait for whole meeting summary to be generated before sending summary email and updating qualAIMeetingCount
  sendNewMeetingSummary(meeting, context).catch(console.log)
  updateQualAIMeetingsCount(meetingId, teamId, dataLoader)
  // wait for meeting stats to be generated before sending Slack notification
  IntegrationNotifier.endMeeting(dataLoader, meetingId, teamId)
  const data = {meetingId}
  const operationId = dataLoader.share()
  const subOptions = {operationId}
  publish(SubscriptionChannel.MEETING, meetingId, 'EndRetrospectiveSuccess', data, subOptions)
}

const safeEndRetrospective = async ({
  meeting,
  context,
  now
}: {
  meeting: MeetingRetrospective
  context: InternalContext
  now: Date
}) => {
  const {authToken, socketId: mutatorId, dataLoader} = context
  const {id: meetingId, phases, facilitatorStageId, teamId} = meeting
  const r = await getRethink()
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  // RESOLUTION
  const currentStageRes = findStageById(phases, facilitatorStageId)
  if (currentStageRes) {
    const {stage} = currentStageRes
    await handleCompletedStage(stage, meeting, dataLoader)
    stage.isComplete = true
    stage.endAt = now
  }
  const phase = getMeetingPhase(phases)

  const insights = await gatherInsights(meeting, dataLoader)
  const completedRetrospective = (await r
    .table('NewMeeting')
    .get(meetingId)
    .update(
      {
        endedAt: now,
        phases,
        ...insights
      },
      {returnChanges: true}
    )('changes')(0)('new_val')
    .default(null)
    .run()) as unknown as MeetingRetrospective

  if (!completedRetrospective) {
    return standardError(new Error('Completed retrospective meeting does not exist'), {
      userId: viewerId
    })
  }

  // remove any empty tasks
  const {templateId} = completedRetrospective
  const [meetingMembers, team, teamMembers, removedTaskIds, template] = await Promise.all([
    dataLoader.get('meetingMembersByMeetingId').load(meetingId),
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('teamMembersByTeamId').load(teamId),
    removeEmptyTasks(meetingId),
    dataLoader.get('meetingTemplates').loadNonNull(templateId),
    pg
      .deleteFrom('RetroReflectionGroup')
      .where('meetingId', '=', meetingId)
      .where('isActive', '=', false)
      .execute(),
    r
      .table('RetroReflectionGroup')
      .getAll(meetingId, {index: 'meetingId'})
      .filter({isActive: false})
      .delete()
      .run(),
    updateTeamInsights(teamId, dataLoader),
    sendKudos(meeting, teamId, context)
  ])
  // wait for removeEmptyTasks before summarizeRetroMeeting
  // don't await for the OpenAI response or it'll hang for a while when ending the retro
  summarizeRetroMeeting(completedRetrospective, context)
  analytics.retrospectiveEnd(completedRetrospective, meetingMembers, template, dataLoader)
  checkTeamsLimit(team.orgId, dataLoader)
  const events = teamMembers.map(
    (teamMember) =>
      new TimelineEventRetroComplete({
        userId: teamMember.userId,
        teamId,
        orgId: team.orgId,
        meetingId
      })
  )
  const timelineEventId = events[0]!.id
  await r.table('TimelineEvent').insert(events).run()

  if (team.isOnboardTeam) {
    const teamLeadUserId = await r
      .table('TeamMember')
      .getAll(teamId, {index: 'teamId'})
      .filter({isLead: true})
      .nth(0)('userId')
      .run()

    const removedSuggestedActionId = await removeSuggestedAction(teamLeadUserId, 'tryRetroMeeting')
    if (removedSuggestedActionId) {
      publish(
        SubscriptionChannel.NOTIFICATION,
        teamLeadUserId,
        'EndRetrospectiveSuccess',
        {removedSuggestedActionId},
        subOptions
      )
    }
  }

  const data = {
    meetingId,
    teamId,
    isKill: !!(phase && phase.phaseType !== DISCUSS),
    removedTaskIds,
    timelineEventId
  }
  publish(SubscriptionChannel.TEAM, teamId, 'EndRetrospectiveSuccess', data, subOptions)

  return data
}

export default safeEndRetrospective

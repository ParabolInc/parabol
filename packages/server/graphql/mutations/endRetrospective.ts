import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {DISCUSS, PARABOL_AI_USER_ID} from 'parabol-client/utils/constants'
import getMeetingPhase from 'parabol-client/utils/getMeetingPhase'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import {checkTeamsLimit} from '../../billing/helpers/teamLimitsCheck'
import getRethink from '../../database/rethinkDriver'
import {RDatum} from '../../database/stricterR'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import MeetingSettingsRetrospective from '../../database/types/MeetingSettingsRetrospective'
import TimelineEventRetroComplete from '../../database/types/TimelineEventRetroComplete'
import removeSuggestedAction from '../../safeMutations/removeSuggestedAction'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getPhase from '../../utils/getPhase'
import publish from '../../utils/publish'
import RecallAIServerManager from '../../utils/RecallAIServerManager'
import sendToSentry from '../../utils/sendToSentry'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import EndRetrospectivePayload from '../types/EndRetrospectivePayload'
import sendNewMeetingSummary from './helpers/endMeeting/sendNewMeetingSummary'
import generateWholeMeetingSentimentScore from './helpers/generateWholeMeetingSentimentScore'
import generateWholeMeetingSummary from './helpers/generateWholeMeetingSummary'
import handleCompletedStage from './helpers/handleCompletedStage'
import {IntegrationNotifier} from './helpers/notifications/IntegrationNotifier'
import removeEmptyTasks from './helpers/removeEmptyTasks'
import updateQualAIMeetingsCount from './helpers/updateQualAIMeetingsCount'

const getTranscription = async (recallBotId?: string | null) => {
  if (!recallBotId) return
  const manager = new RecallAIServerManager()
  return await manager.getBotTranscript(recallBotId)
}

const finishRetroMeeting = async (meeting: MeetingRetrospective, context: GQLContext) => {
  const {dataLoader, authToken} = context
  const {id: meetingId, phases, facilitatorUserId, teamId} = meeting
  const r = await getRethink()
  const [reflectionGroups, reflections, meetingSettings, sentimentScore] = await Promise.all([
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('meetingSettingsByType').load({teamId, meetingType: 'retrospective'}),
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
  const {id: settingsId, recallBotId} = meetingSettings as MeetingSettingsRetrospective
  const [summary, transcription] = await Promise.all([
    generateWholeMeetingSummary(discussionIds, meetingId, teamId, facilitatorUserId, dataLoader),
    getTranscription(recallBotId)
  ])

  await Promise.all([
    r
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
      .run(),
    r
      .table('MeetingSettings')
      .get(settingsId)
      .update({
        recallBotId: null,
        videoMeetingURL: null
      })
      .run()
  ])
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

export default {
  type: new GraphQLNonNull(EndRetrospectivePayload),
  description: 'Finish a retrospective meeting',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The meeting to end'
    }
  },
  async resolve(_source: unknown, {meetingId}: {meetingId: string}, context: GQLContext) {
    const {authToken, socketId: mutatorId, dataLoader} = context
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const now = new Date()
    const viewerId = getUserId(authToken)

    // AUTH
    const meeting = (await r
      .table('NewMeeting')
      .get(meetingId)
      .default(null)
      .run()) as MeetingRetrospective | null
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, facilitatorStageId, phases, teamId} = meeting

    // VALIDATION
    if (!isTeamMember(authToken, teamId) && authToken.rol !== 'su') {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})

    // RESOLUTION
    const currentStageRes = findStageById(phases, facilitatorStageId)
    if (currentStageRes) {
      const {stage} = currentStageRes
      await handleCompletedStage(stage, meeting, dataLoader)
      stage.isComplete = true
      stage.endAt = now
    }
    const phase = getMeetingPhase(phases)

    const completedRetrospective = (await r
      .table('NewMeeting')
      .get(meetingId)
      .update(
        {
          endedAt: now,
          phases
        },
        {returnChanges: true}
      )('changes')(0)('new_val')
      .default(null)
      .run()) as unknown as MeetingRetrospective

    if (!completedRetrospective) {
      return standardError(new Error('Completed check-in meeting does not exist'), {
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
      r
        .table('RetroReflectionGroup')
        .getAll(meetingId, {index: 'meetingId'})
        .filter({isActive: false})
        .delete()
        .run()
    ])
    // wait for removeEmptyTasks before finishRetroMeeting
    // don't await for the OpenAI response or it'll hang for a while when ending the retro
    finishRetroMeeting(completedRetrospective, context)
    analytics.retrospectiveEnd(completedRetrospective, meetingMembers, template)
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

      const removedSuggestedActionId = await removeSuggestedAction(
        teamLeadUserId,
        'tryRetroMeeting'
      )
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
}

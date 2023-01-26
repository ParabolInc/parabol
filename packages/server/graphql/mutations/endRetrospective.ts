import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {DISCUSS, PARABOL_AI_USER_ID} from 'parabol-client/utils/constants'
import getMeetingPhase from 'parabol-client/utils/getMeetingPhase'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import {checkTeamsLimit} from '../../billing/helpers/teamLimitsCheck'
import getRethink from '../../database/rethinkDriver'
import {RDatum} from '../../database/stricterR'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import TimelineEventRetroComplete from '../../database/types/TimelineEventRetroComplete'
import removeSuggestedAction from '../../safeMutations/removeSuggestedAction'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getPhase from '../../utils/getPhase'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import EndRetrospectivePayload from '../types/EndRetrospectivePayload'
import sendNewMeetingSummary from './helpers/endMeeting/sendNewMeetingSummary'
import generateWholeMeetingSummary from './helpers/generateWholeMeetingSummary'
import handleCompletedStage from './helpers/handleCompletedStage'
import {IntegrationNotifier} from './helpers/notifications/IntegrationNotifier'
import removeEmptyTasks from './helpers/removeEmptyTasks'

const finishRetroMeeting = async (
  meeting: MeetingRetrospective,
  teamId: string,
  context: GQLContext
) => {
  const {dataLoader} = context
  const {id: meetingId, phases, facilitatorUserId} = meeting
  const r = await getRethink()
  const [reflectionGroups, reflections] = await Promise.all([
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
  ])
  const discussPhase = getPhase(phases, 'discuss')
  const {stages} = discussPhase
  const discussionIds = stages.map((stage) => stage.discussionId)

  const reflectionGroupIds = reflectionGroups.map(({id}) => id)

  await Promise.all([
    generateWholeMeetingSummary(discussionIds, meetingId, facilitatorUserId, dataLoader),
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
          reflectionCount: reflections.length
        },
        {nonAtomic: true}
      )
      .run()
  ])
  // wait for whole meeting summary to be generated before sending summary email
  sendNewMeetingSummary(meeting, context).catch(console.log)
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
    if (!currentStageRes) {
      return standardError(new Error('Cannot find facilitator stage'), {userId: viewerId})
    }
    const {stage} = currentStageRes
    await handleCompletedStage(stage, meeting, dataLoader)
    const phase = getMeetingPhase(phases)
    stage.isComplete = true
    stage.endAt = now

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
      dataLoader.get('meetingTemplates').load(templateId),
      r
        .table('RetroReflectionGroup')
        .getAll(meetingId, {index: 'meetingId'})
        .filter({isActive: false})
        .delete()
        .run()
    ])
    // wait for removeEmptyTasks before finishRetroMeeting
    // don't await for the OpenAI response or it'll hang for a while when ending the retro
    finishRetroMeeting(completedRetrospective, teamId, context)
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
      isKill: phase && phase.phaseType !== DISCUSS,
      removedTaskIds,
      timelineEventId
    }
    publish(SubscriptionChannel.TEAM, teamId, 'EndRetrospectiveSuccess', data, subOptions)

    return data
  }
}

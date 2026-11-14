import type {Insertable} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isOpenTask from 'parabol-client/utils/isOpenTask'
import isSeedTask from 'parabol-client/utils/isSeedTask'
import MeetingMemberId from '../../../../client/shared/gqlIds/MeetingMemberId'
import {positionAfter} from '../../../../client/shared/sortOrder'
import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
// TODO: CheckInStage, TeamPromptResponseStage, UpdatesStage are from the deprecated /database directory
import CheckInStage from '../../../database/types/CheckInStage'
import TeamPromptResponseStage from '../../../database/types/TeamPromptResponseStage'
import UpdatesStage from '../../../database/types/UpdatesStage'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import type {TeamMember} from '../../../postgres/types'
import type {AnyMeeting} from '../../../postgres/types/Meeting'
import type {
  CheckInStage as CheckInStageDB,
  NewMeetingPhase,
  TeamPromptResponseStage as TeamPromptResponseStageDB,
  UpdatesStage as UpdatesStageDB
} from '../../../postgres/types/NewMeetingPhase'
import type {MeetingMember} from '../../../postgres/types/pg'
import {getUserId} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

type TeamMemberStage = CheckInStageDB | UpdatesStageDB | TeamPromptResponseStageDB

export const createMeetingMember = (
  meeting: AnyMeeting,
  teamMember: Pick<TeamMember, 'userId' | 'teamId' | 'isSpectatingPoker' | 'isLead'>
): Insertable<MeetingMember> => {
  const {userId, teamId, isSpectatingPoker, isLead} = teamMember
  const {id: meetingId, meetingType} = meeting
  return {
    id: MeetingMemberId.join(meetingId, userId),
    updatedAt: new Date(),
    teamId,
    userId,
    meetingId,
    meetingType,
    // the team lead is a data collector by default, excluded from the response set until they opt
    // in. Unlike poker, this is per-meeting & never persisted back to the team member
    isSpectating:
      meetingType === 'poker' ? isSpectatingPoker : meetingType === 'teamHealth' ? isLead : null,
    votesRemaining: meetingType === 'retrospective' ? meeting.totalVotes : null
  }
}

const joinMeeting: MutationResolvers['joinMeeting'] = async (
  _source,
  {meetingId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) return {error: {message: 'Invalid meeting ID'}}
  const {endedAt, teamId, phases} = meeting
  if (endedAt) {
    // a member can still subscribe to a meeting that ended, but nobody new joins it
    const meetingMember = await dataLoader
      .get('meetingMembers')
      .load(MeetingMemberId.join(meetingId, viewerId))
    if (!meetingMember) return {error: {message: 'Meeting has already ended'}}
    return {meetingId, userId: viewerId}
  }

  const teamMemberId = toTeamMemberId(teamId, viewerId)
  const teamMember = await dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  const meetingMember = createMeetingMember(meeting, teamMember)
  const insertResult = await pg
    .insertInto('MeetingMember')
    .values(meetingMember)
    .onConflict((oc) => oc.doNothing())
    .executeTakeFirstOrThrow()
  const wasInserted = Number(insertResult.numInsertedOrUpdatedRows) > 0

  const addStageToPhase = async (
    createStage: (sortOrder: string) => TeamMemberStage,
    phaseType: TeamMemberStage['phaseType']
  ) => {
    return pg.transaction().execute(async (trx) => {
      const meeting = await trx
        .selectFrom('NewMeeting')
        .select(({fn}) => fn<NewMeetingPhase[]>('to_json', ['phases']).as('phases'))
        .where('id', '=', meetingId)
        .forUpdate()
        .executeTakeFirst()
      if (!meeting) return false
      const {phases} = meeting
      const phase = getPhase(phases, phaseType)
      const stages: TeamMemberStage[] = phase.stages
      if (stages.some((existing) => existing.teamMemberId === teamMemberId)) return false
      // a stage from before sortOrder existed has none, and goes right after the stage before it
      const lastSortOrder = stages.reduce(
        (previous, existing) => existing.sortOrder ?? positionAfter(previous),
        ''
      )
      const sortOrder = positionAfter(lastSortOrder)
      stages.push({
        ...createStage(sortOrder),
        isNavigable: true,
        isNavigableByFacilitator: true,
        isComplete: stages.length >= 1 && stages.every((stage) => stage.isComplete)
      })
      await trx
        .updateTable('NewMeeting')
        .set({phases: JSON.stringify(phases)})
        .where('id', '=', meetingId)
        .execute()
      return true
    })
  }

  // a viewer the loaded meeting already has a stage for, like one rejoining, needs no lock to find that out
  const hasStage = (stages: TeamMemberStage[]) =>
    stages.some((stage) => stage.teamMemberId === teamMemberId)

  const appendToCheckin = async () => {
    const checkInPhase = getPhase(phases, 'checkin')
    if (!checkInPhase || hasStage(checkInPhase.stages)) return false
    return addStageToPhase((sortOrder) => new CheckInStage(teamMemberId, sortOrder), 'checkin')
  }

  const teamHasOpenTasks = async () => {
    const teamTasks = await dataLoader.get('tasksByTeamId').load(teamId)
    return teamTasks.some((task) => !!task.userId && isOpenTask(task) && !isSeedTask(task))
  }

  const appendToUpdate = async () => {
    const updatesPhase = getPhase(phases, 'updates')
    if (!updatesPhase || hasStage(updatesPhase.stages)) return false
    if (meeting.meetingType === 'retrospective' && !(await teamHasOpenTasks())) return false
    return addStageToPhase((sortOrder) => new UpdatesStage(teamMemberId, sortOrder), 'updates')
  }

  const appendToTeamPromptResponses = async () => {
    const responsesPhase = getPhase(phases, 'RESPONSES')
    if (!responsesPhase || hasStage(responsesPhase.stages)) return false
    const discussionId = generateUID()
    await getKysely()
      .insertInto('Discussion')
      .values({
        id: discussionId,
        teamId,
        meetingId,
        discussionTopicId: teamMemberId,
        discussionTopicType: 'teamPromptResponse'
      })
      .execute()
    return addStageToPhase(
      (sortOrder) => new TeamPromptResponseStage({teamMemberId, discussionId, sortOrder}),
      'RESPONSES'
    )
  }

  const stagesAdded = await Promise.all([
    appendToCheckin(),
    appendToUpdate(),
    appendToTeamPromptResponses()
  ])
  dataLoader.clearAll('newMeetings')

  const data = {meetingId, userId: viewerId}
  if (wasInserted || stagesAdded.includes(true)) {
    publish(SubscriptionChannel.MEETING, meetingId, 'JoinMeetingSuccess', data, subOptions)
  }
  return data
}

export default joinMeeting

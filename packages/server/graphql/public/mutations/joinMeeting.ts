import type {Insertable} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingMemberId from '../../../../client/shared/gqlIds/MeetingMemberId'
import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
// TODO: CheckInStage, TeamPromptResponseStage, UpdatesStage are from the deprecated /database directory
import CheckInStage from '../../../database/types/CheckInStage'
import TeamPromptResponseStage from '../../../database/types/TeamPromptResponseStage'
import UpdatesStage from '../../../database/types/UpdatesStage'
import getKysely from '../../../postgres/getKysely'
import type {TeamMember} from '../../../postgres/types'
import type {AnyMeeting} from '../../../postgres/types/Meeting'
import type {
  CheckInStage as CheckInStageDB,
  NewMeetingPhase,
  NewMeetingStage,
  TeamPromptResponseStage as TeamPromptResponseStageDB,
  UpdatesStage as UpdatesStageDB
} from '../../../postgres/types/NewMeetingPhase'
import type {MeetingMember} from '../../../postgres/types/pg'
import {getUserId} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

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
    stage: CheckInStageDB | UpdatesStageDB | TeamPromptResponseStageDB,
    phaseType: NewMeetingPhase['phaseType']
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
      const stages = phase.stages as NewMeetingStage[]
      if (
        stages.some(
          (existing) => 'teamMemberId' in existing && existing.teamMemberId === teamMemberId
        )
      ) {
        return false
      }
      stages.push({
        ...stage,
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

  const appendToCheckin = async () => {
    const checkInPhase = getPhase(phases, 'checkin')
    if (!checkInPhase) return false
    const checkInStage = new CheckInStage(teamMemberId)
    return addStageToPhase(checkInStage, 'checkin')
  }

  const appendToUpdate = async () => {
    const updatesPhase = getPhase(phases, 'updates')
    if (!updatesPhase) return false
    const updatesStage = new UpdatesStage(teamMemberId)
    return addStageToPhase(updatesStage, 'updates')
  }

  const appendToTeamPromptResponses = async () => {
    const responsesPhase = getPhase(phases, 'RESPONSES')
    if (!responsesPhase) return false
    const teamMemberResponseStage = responsesPhase.stages.find(
      (stage) => stage.teamMemberId === teamMemberId
    )
    if (teamMemberResponseStage) return false
    const responsesStage = new TeamPromptResponseStage({teamMemberId})
    await getKysely()
      .insertInto('Discussion')
      .values({
        id: responsesStage.discussionId,
        teamId,
        meetingId,
        discussionTopicId: teamMemberId,
        discussionTopicType: 'teamPromptResponse'
      })
      .execute()
    return addStageToPhase(responsesStage, 'RESPONSES')
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

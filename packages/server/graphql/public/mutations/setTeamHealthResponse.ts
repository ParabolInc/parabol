import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingMemberId from '../../../../client/shared/gqlIds/MeetingMemberId'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const setTeamHealthResponse: MutationResolvers['setTeamHealthResponse'] = async (
  _source,
  {meetingId, stageId, score, comment},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()

  // AUTH
  const [meeting, meetingMember] = await Promise.all([
    dataLoader.get('newMeetings').loadNonNull(meetingId),
    dataLoader.get('meetingMembers').load(MeetingMemberId.join(meetingId, viewerId))
  ])
  const {endedAt, phases, teamId, meetingType} = meeting
  if (meetingType !== 'teamHealth') {
    throw new GraphQLError('Not a team health meeting')
  }
  if (endedAt) {
    throw new GraphQLError('Meeting has ended')
  }

  // VALIDATION
  if (score !== null && score !== undefined && (score < 1 || score > 5)) {
    throw new GraphQLError('Score must be between 1 and 5')
  }
  const responsePhase = getPhase(phases, 'TEAM_HEALTH_RESPONSE')
  const stage = responsePhase.stages.find((stage) => stage.id === stageId)
  if (!stage) {
    throw new GraphQLError('Invalid stageId provided')
  }
  // spectators (the owner, by default) are excluded from the response set until they opt in
  if (!meetingMember) {
    throw new GraphQLError('Join the meeting before answering')
  }
  if (meetingMember.isSpectating) {
    throw new GraphQLError('Opt in with Start your response before answering')
  }
  const {questionId} = stage

  await pg
    .insertInto('TeamHealthResponse')
    .values({
      meetingId,
      questionId,
      userId: viewerId,
      score: score ?? null,
      comment: comment ?? null,
      updatedAt: sql`CURRENT_TIMESTAMP`
    })
    .onConflict((oc) =>
      oc.columns(['meetingId', 'questionId', 'userId']).doUpdateSet({
        score: score ?? null,
        comment: comment ?? null,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
    )
    .execute()
  dataLoader.get('teamHealthResponsesByMeetingId').clear(meetingId)

  const data = {
    meetingId,
    teamId,
    stage: {...stage, meetingId, teamId}
  }
  publish(SubscriptionChannel.MEETING, meetingId, 'SetTeamHealthResponseSuccess', data, subOptions)
  return data
}

export default setTeamHealthResponse

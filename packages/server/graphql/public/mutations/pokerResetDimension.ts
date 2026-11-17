import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import getKysely from '../../../postgres/getKysely'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const pokerResetDimension: MutationResolvers['pokerResetDimension'] = async (
  _source,
  {meetingId, stageId},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) {
    throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  }
  if (meeting.meetingType !== 'poker') {
    throw new GraphQLError('Not a poker meeting', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const {endedAt, phases} = meeting
  if (endedAt) {
    throw new GraphQLError('Meeting has ended', {extensions: {code: 'CONFLICT'}})
  }
  if (isPhaseComplete('ESTIMATE', phases)) {
    throw new GraphQLError('Estimate phase is already complete', {extensions: {code: 'CONFLICT'}})
  }

  // VALIDATION
  const estimatePhase = getPhase(phases, 'ESTIMATE')
  const estimatePhaseIdx = phases.indexOf(estimatePhase)
  const {stages} = estimatePhase
  const stageIdx = stages.findIndex((stage) => stage.id === stageId)
  const stage = stages[stageIdx]
  if (!stage) {
    throw new GraphQLError('Invalid stageId provided', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  // RESOLUTION
  Object.assign(stage, {isVoting: true, scores: []})
  await Promise.all([
    pg
      .updateTable('NewMeeting')
      .set({
        phases: sql`jsonb_set(
          jsonb_set(phases, ${sql.lit(`{${estimatePhaseIdx},stages,${stageIdx},"scores"}`)}, '[]'::jsonb, false),
          ${sql.lit(`{${estimatePhaseIdx},stages,${stageIdx},"isVoting"}`)}, 'true'::jsonb, false
        )`
      })
      .where('id', '=', meetingId)
      .execute(),
    pg
      .deleteFrom('TaskEstimate')
      .where('meetingId', '=', meetingId)
      .where('stageId', '=', stageId)
      .execute()
  ])
  dataLoader.clearAll('newMeetings')

  const data = {meetingId, stageId}
  publish(SubscriptionChannel.MEETING, meetingId, 'PokerResetDimensionSuccess', data, subOptions)
  return data
}

export default pokerResetDimension

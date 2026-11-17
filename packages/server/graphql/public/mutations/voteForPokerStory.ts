import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import EstimateUserScore from '../../../database/types/EstimateUserScore'
import getKysely from '../../../postgres/getKysely'
import type {NewMeetingPhase} from '../../../postgres/types/NewMeetingPhase'
import {getUserId} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

export const removeVoteForUserId = async (userId: string, stageId: string, meetingId: string) => {
  await getKysely()
    .transaction()
    .execute(async (trx) => {
      const meeting = await trx
        .selectFrom('NewMeeting')
        .select(({fn}) => fn<NewMeetingPhase[]>('to_json', ['phases']).as('phases'))
        .where('id', '=', meetingId)
        .forUpdate()
        // NewMeeting: add OrThrow in phase 3
        .executeTakeFirst()
      if (!meeting) return
      const {phases} = meeting
      const phase = getPhase(phases, 'ESTIMATE')
      const {stages} = phase
      const stage = stages.find((stage) => stage.id === stageId)!
      const {scores} = stage
      stage.scores = scores.filter((score) => score.userId !== userId)
      await trx
        .updateTable('NewMeeting')
        .set({phases: JSON.stringify(phases)})
        .where('id', '=', meetingId)
        .execute()
    })
}

const upsertVote = async (vote: EstimateUserScore, stageId: string, meetingId: string) => {
  await getKysely()
    .transaction()
    .execute(async (trx) => {
      const meeting = await trx
        .selectFrom('NewMeeting')
        .select(({fn}) => fn<NewMeetingPhase[]>('to_json', ['phases']).as('phases'))
        .where('id', '=', meetingId)
        .forUpdate()
        // NewMeeting: add OrThrow in phase 3
        .executeTakeFirst()
      if (!meeting) return
      const {phases} = meeting
      const phase = getPhase(phases, 'ESTIMATE')
      const {stages} = phase
      const stage = stages.find((stage) => stage.id === stageId)!
      const {scores} = stage
      stage.scores = [...scores.filter((score) => score.userId !== vote.userId), vote]
      await trx
        .updateTable('NewMeeting')
        .set({phases: JSON.stringify(phases)})
        .where('id', '=', meetingId)
        .execute()
    })
}

const voteForPokerStory: MutationResolvers['voteForPokerStory'] = async (
  _source,
  {meetingId, stageId, score},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  //AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) {
    throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  }
  if (meeting.meetingType !== 'poker') {
    throw new GraphQLError('Not a poker meeting', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const {endedAt, phases, templateRefId} = meeting
  if (endedAt) {
    throw new GraphQLError('Meeting has ended', {extensions: {code: 'CONFLICT'}})
  }

  // VALIDATION
  const estimatePhase = getPhase(phases, 'ESTIMATE')
  const {stages} = estimatePhase
  const stage = stages.find((stage) => stage.id === stageId)
  if (!stage) {
    throw new GraphQLError('Invalid stageId provided', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  // RESOLUTION
  const {dimensionRefIdx} = stage
  const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
  const {dimensions} = templateRef
  const dimensionRef = dimensions[dimensionRefIdx]!
  const {scaleRefId} = dimensionRef
  const scaleRef = await dataLoader.get('templateScaleRefs').loadNonNull(scaleRefId)
  const {values} = scaleRef
  if (score) {
    // validate the score is a value on the scale
    const scoreValue = values.find((value) => value.label === score)
    if (!scoreValue) {
      throw new GraphQLError('Score does not exist in scale', {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }
    const userScore = new EstimateUserScore({
      userId: viewerId,
      label: scoreValue.label
    })
    await upsertVote(userScore, stageId, meetingId)
  } else {
    // undo the vote, remove from array
    await removeVoteForUserId(viewerId, stageId, meetingId)
  }
  dataLoader.get('newMeetings').clear(meetingId)

  const data = {meetingId, stageId}
  publish(SubscriptionChannel.MEETING, meetingId, 'VoteForPokerStorySuccess', data, subOptions)
  return data
}

export default voteForPokerStory

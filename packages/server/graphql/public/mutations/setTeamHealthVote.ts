import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import type TeamHealthVote from '../../../database/types/TeamHealthVote'
import getKysely from '../../../postgres/getKysely'
import type {NewMeetingPhase} from '../../../postgres/types/NewMeetingPhase.d'
import {getUserId} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const upsertVote = async (meetingId: string, newVote: TeamHealthVote) => {
  const pg = getKysely()
  await pg.transaction().execute(async (trx) => {
    const meeting = await trx
      .selectFrom('NewMeeting')
      .select(({fn}) => fn<NewMeetingPhase[]>('to_json', ['phases']).as('phases'))
      .where('id', '=', meetingId)
      .forUpdate()
      // NewMeeting: add OrThrow in phase 3
      .executeTakeFirst()
    if (!meeting) return
    const {phases} = meeting
    const phase = getPhase(phases, 'TEAM_HEALTH')
    const {stages} = phase
    const [stage] = stages
    const {votes} = stage
    const existingVote = votes.find((vote) => vote.userId === newVote.userId)
    if (existingVote) {
      existingVote.vote = newVote.vote
    } else {
      votes.push(newVote)
    }
    await trx
      .updateTable('NewMeeting')
      .set({phases: JSON.stringify(phases)})
      .where('id', '=', meetingId)
      .execute()
  })
}

const setTeamHealthVote: MutationResolvers['setTeamHealthVote'] = async (
  _source,
  {meetingId, stageId, label},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  //AUTH
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {endedAt, phases, teamId} = meeting
  if (endedAt) {
    throw new GraphQLError('Meeting has ended', {extensions: {code: 'CONFLICT'}})
  }

  // VALIDATION
  const teamHealthPhase = getPhase(phases, 'TEAM_HEALTH')
  const {stages} = teamHealthPhase
  const stage = stages.find((stage) => stage.id === stageId)
  if (!stage || stage.phaseType !== 'TEAM_HEALTH') {
    throw new GraphQLError('Invalid stageId provided', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  if (stage.isRevealed) {
    throw new GraphQLError('Votes are already revealed', {extensions: {code: 'CONFLICT'}})
  }

  const vote = stage.labels.indexOf(label)
  if (vote === -1) {
    throw new GraphQLError('Invalid label provided', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  await upsertVote(meetingId, {userId: viewerId, vote})
  // update dataloader
  const existingVote = stage.votes.find((vote) => vote.userId === viewerId)
  if (existingVote) {
    existingVote.vote = vote
  } else {
    stage.votes.push({userId: viewerId, vote})
  }

  const data = {
    meetingId,
    stageId,
    teamId,
    stage: {
      ...stage,
      meetingId,
      teamId
    }
  }

  publish(SubscriptionChannel.MEETING, meetingId, 'SetTeamHealthVoteSuccess', data, subOptions)

  return data
}

export default setTeamHealthVote

import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingMemberId from '../../../../client/shared/gqlIds/MeetingMemberId'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import logError from '../../../utils/logError'
import publish from '../../../utils/publish'
import paraphraseTeamHealthResponse, {
  PENDING_PARAPHRASE
} from '../../mutations/helpers/paraphraseTeamHealthResponse'
import type {MutationResolvers} from '../resolverTypes'

const setTeamHealthResponse: MutationResolvers['setTeamHealthResponse'] = async (
  _source,
  {meetingId, stageId, score, comment, isAnonymous},
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
  const nextComment = comment || null
  // picking a score saves the whole answer, so the same comment arrives many times. Only a comment
  // that actually changed is worth an LLM call, and a paraphrase already in flight or in hand is
  // never thrown away. A null paraphrase means the last attempt failed, so that one is retried
  const responses = await dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
  const priorResponse = responses.find(
    (response) => response.userId === viewerId && response.questionId === questionId
  )
  const isCommentUnchanged = !!nextComment && priorResponse?.comment === nextComment
  const priorParaphrase = priorResponse?.isAnonymous ? priorResponse.commentParaphrased : null
  const isAlreadyAnonymized = isCommentUnchanged && priorParaphrase !== null

  // an anonymous comment is never readable in the author's own words, so it is stored pending a
  // paraphrase and only becomes visible once the LLM has rewritten it. A signed comment needs no
  // rewrite, so it is shown as written and holds no paraphrase at all
  const commentParaphrased =
    !nextComment || !isAnonymous
      ? null
      : isAlreadyAnonymized
        ? priorParaphrase!
        : PENDING_PARAPHRASE

  await pg
    .insertInto('TeamHealthResponse')
    .values({
      meetingId,
      questionId,
      userId: viewerId,
      score: score ?? null,
      comment: nextComment,
      commentParaphrased,
      isAnonymous: !!nextComment && !!isAnonymous,
      updatedAt: sql`CURRENT_TIMESTAMP`
    })
    .onConflict((oc) =>
      oc.columns(['meetingId', 'questionId', 'userId']).doUpdateSet({
        score: score ?? null,
        comment: nextComment,
        commentParaphrased,
        isAnonymous: !!nextComment && !!isAnonymous,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
    )
    .execute()
  dataLoader.get('teamHealthResponsesByMeetingId').clear(meetingId)
  if (nextComment && commentParaphrased === PENDING_PARAPHRASE) {
    // detached: the author shouldn't wait on the LLM, and nobody may read the result until the
    // meeting ends
    paraphraseTeamHealthResponse({
      meetingId,
      questionId,
      userId: viewerId,
      comment: nextComment
    }).catch(logError)
  }

  const data = {
    meetingId,
    teamId,
    stage: {...stage, meetingId, teamId}
  }
  publish(SubscriptionChannel.MEETING, meetingId, 'SetTeamHealthResponseSuccess', data, subOptions)
  return data
}

export default setTeamHealthResponse

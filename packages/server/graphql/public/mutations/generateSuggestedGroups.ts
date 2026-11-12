import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {suggestedGroupsDuration} from '../../../metricsHandler'
import {getUserId} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import getRedis from '../../../utils/getRedis'
import publish from '../../../utils/publish'
import canAccessAI from '../../mutations/helpers/canAccessAI'
import computeSuggestedGroups from '../../mutations/helpers/computeSuggestedGroups'
import upsertSuggestedGrouping from '../../mutations/helpers/upsertSuggestedGrouping'
import type {MutationResolvers} from '../resolverTypes'

const MAX_USER_PROMPT_LENGTH = 2000
// Long enough to cover per-column LLM calls, short enough that a hung provider frees the lock
const LOCK_TTL_MS = 60_000

const generateSuggestedGroups: MutationResolvers['generateSuggestedGroups'] = async (
  _source,
  args,
  context
) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  // SDL defaults leave these optional in the generated arg type, so re-apply them here
  const {meetingId, mode = 'similarity', sameColumnOnly = false} = args
  const viewerId = getUserId(authToken)
  const startedAt = Date.now()

  // VALIDATION
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  if (meeting.endedAt)
    throw new GraphQLError('Meeting already ended', {extensions: {code: 'CONFLICT'}})
  if (meeting.meetingType !== 'retrospective') {
    throw new GraphQLError('Suggested groups are only available in retrospective meetings', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  const groupPhase = getPhase(meeting.phases, 'group')
  if (groupPhase?.stages[0]?.isComplete) {
    throw new GraphQLError('The group phase is over, so reflections can no longer be regrouped', {
      extensions: {code: 'CONFLICT'}
    })
  }

  const userPrompt = args.userPrompt?.trim() || null
  if (userPrompt && userPrompt.length > MAX_USER_PROMPT_LENGTH) {
    throw new GraphQLError(
      `Custom instructions must be under ${MAX_USER_PROMPT_LENGTH} characters`,
      {extensions: {code: 'BAD_USER_INPUT'}}
    )
  }
  if (mode !== 'ai' && userPrompt) {
    throw new GraphQLError('Custom instructions are only supported when mode is ai', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  const {teamId} = meeting
  // Gated here rather than in permissions.ts because it depends on an argument value and needs a
  // specific, actionable message where a graphql-shield failure would be generic
  if (mode === 'ai') {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    if (!(await canAccessAI(team, dataLoader))) {
      throw new GraphQLError('AI grouping is not available for this organization', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
  }

  // RESOLUTION
  // Serialized so two viewers asking at once cannot each pay for an LLM call and then race to
  // store the set the other just wrote. Claimed with SET NX so a caller either gets the lock on the
  // first round trip or gives up: there is no queue, since a second run would only recompute what
  // the holder is about to publish. refreshSuggestedGroups takes the same key.
  const redis = getRedis()
  const lockKey = `lock:suggestedGrouping:${meetingId}`
  const hasLock = await redis.set(lockKey, viewerId, 'PX', LOCK_TTL_MS, 'NX')
  if (!hasLock) {
    throw new GraphQLError('Someone else is already suggesting groups for this meeting', {
      extensions: {code: 'CONFLICT'}
    })
  }

  try {
    const config = {mode, userPrompt, sameColumnOnly}
    // Throws a GraphQLError the client shows in a snackbar. Nothing is stored for a failed run, so
    // the previous suggestions stay on the board rather than being replaced by an empty set.
    const {groups, inputHash, cacheHit} = await computeSuggestedGroups(
      meetingId,
      config,
      dataLoader
    )

    await upsertSuggestedGrouping(
      {...config, meetingId, createdByUserId: viewerId, inputHash, groups},
      dataLoader
    )

    suggestedGroupsDuration.observe(
      {mode, cache: cacheHit ? 'hit' : 'miss'},
      (Date.now() - startedAt) / 1000
    )

    const operationId = dataLoader.share()
    const data = {meetingId, isUserInitiated: true}
    publish(SubscriptionChannel.MEETING, meetingId, 'SuggestedGroupsSuccess', data, {
      operationId,
      mutatorId
    })
    return data
  } finally {
    await redis.del(lockKey)
  }
}

export default generateSuggestedGroups

import {GraphQLError} from 'graphql'
import MeetingMemberId from 'parabol-client/shared/gqlIds/MeetingMemberId'
import {Polls, SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const createPoll: MutationResolvers['createPoll'] = async (
  _source,
  {newPoll},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const {discussionId, threadSortOrder, title, options} = newPoll

  // VALIDATION
  if (title.length < Polls.MIN_TITLE_LENGTH) {
    throw new GraphQLError(
      `Poll title too short, provided title is ${title.length}, min ${Polls.MIN_TITLE_LENGTH}`,
      {extensions: {code: 'BAD_USER_INPUT'}}
    )
  }
  if (title.length > Polls.MAX_TITLE_LENGTH) {
    throw new GraphQLError(
      `Poll title too long, provided title is ${title.length}, max ${Polls.MAX_TITLE_LENGTH}`,
      {extensions: {code: 'BAD_USER_INPUT'}}
    )
  }
  if (options.length === 0) {
    throw new GraphQLError('No poll options provided', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  if (options.length < Polls.MIN_OPTIONS) {
    throw new GraphQLError(
      `Poll has to have at least ${Polls.MIN_OPTIONS} options, provided ${options.length}`,
      {extensions: {code: 'BAD_USER_INPUT'}}
    )
  }
  if (options.length > Polls.MAX_OPTIONS) {
    throw new GraphQLError(
      `Poll can have at most ${Polls.MAX_OPTIONS} options, provided ${options.length}`,
      {extensions: {code: 'BAD_USER_INPUT'}}
    )
  }
  if (options.some((option) => option.title.length === 0)) {
    throw new GraphQLError('All options need a title', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const discussion = await dataLoader.get('discussions').load(discussionId)
  if (!discussion) {
    throw new GraphQLError('Invalid discussion thread', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const {meetingId, teamId} = discussion
  if (!meetingId) {
    throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const meetingMemberId = MeetingMemberId.join(meetingId, viewerId)
  const viewerMeetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
  if (!viewerMeetingMember) {
    throw new GraphQLError('Not a member of the meeting', {extensions: {code: 'FORBIDDEN'}})
  }

  // RESOLUTION
  // this is broken, but we're not using polls, so not fixing it!
  const insertPollResult = await getKysely()
    .with('poll', (qc) =>
      qc
        .insertInto('Poll')
        .values({
          createdById: viewerId,
          teamId,
          meetingId,
          discussionId,
          threadSortOrder,
          title
        })
        .returningAll()
    )
    .insertInto('PollOption')
    .columns(['title', 'pollId'])
    .expression((eb) =>
      eb
        .selectFrom('poll')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .select((eb) => [eb.val(options as any).as('userId'), eb.ref('poll.id').as('pollId')])
    )
    .returning('PollOption.pollId')
    .execute()

  if (insertPollResult.length === 0) {
    throw new GraphQLError(`Couldn't create a poll`, {extensions: {code: 'INTERNAL_SERVER_ERROR'}})
  }

  const {pollId} = insertPollResult[0]!

  const data = {pollId}
  publish(SubscriptionChannel.MEETING, meetingId, 'CreatePollSuccess', data, subOptions)
  return data
}

export default createPoll

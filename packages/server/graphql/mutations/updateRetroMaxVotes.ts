import {GraphQLID, GraphQLInt, GraphQLNonNull} from 'graphql'
import {MeetingSettingsThreshold, SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import mode from 'parabol-client/utils/mode'
import getRethink from '../../database/rethinkDriver'
import {RValue} from '../../database/stricterR'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import UpdateRetroMaxVotesPayload from '../types/UpdateRetroMaxVotesPayload'

const updateRetroMaxVotes = {
  type: new GraphQLNonNull(UpdateRetroMaxVotesPayload),
  description: `Change the max votes for participants`,
  args: {
    totalVotes: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The total number of votes for each participant'
    },
    maxVotesPerGroup: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The total number of votes for each participant to vote on a single topic'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the meeting to update'
    }
  },
  resolve: async (
    _source: unknown,
    {
      totalVotes,
      maxVotesPerGroup,
      meetingId
    }: {totalVotes: number; maxVotesPerGroup: number; meetingId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const pg = getKysely()
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    const meeting = await dataLoader.get('newMeetings').load(meetingId)

    if (!meeting) {
      return {error: {message: 'Meeting not found'}}
    }

    const {
      endedAt,
      meetingType,
      phases,
      teamId,
      totalVotes: oldTotalVotes,
      maxVotesPerGroup: oldMaxVotesPerGroup
    } = meeting

    if (meetingType !== 'retrospective') {
      return {error: {message: `Meeting not found`}}
    }

    if (endedAt) {
      return {error: {message: `Meeting already ended`}}
    }

    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    if (isPhaseComplete('vote', phases)) {
      return standardError(new Error('Vote phase already completed'), {userId: viewerId})
    }

    // VALIDATION
    if (
      totalVotes < maxVotesPerGroup ||
      totalVotes > MeetingSettingsThreshold.RETROSPECTIVE_TOTAL_VOTES_MAX ||
      maxVotesPerGroup < 1 ||
      maxVotesPerGroup > totalVotes
    ) {
      return standardError(new Error('Invalid max votes'), {
        userId: viewerId,
        tags: {totalVotes, maxVotesPerGroup}
      })
    }

    const delta = totalVotes - oldTotalVotes
    // this isn't 100% atomic, but it's done in a single call, so it's pretty close
    // eventual consistancy is OK, it's just possible for a client to get a bad data in between the 2 updates
    // if votesRemaining goes negative for any user, we know we can't decrease any more
    const hasError = await r
      .table('MeetingMember')
      .getAll(meetingId, {index: 'meetingId'})
      .update(
        (member: RValue) => ({
          votesRemaining: member('votesRemaining').add(delta)
        }),
        {returnChanges: true}
      )('changes')('new_val')('votesRemaining')
      .min()
      .lt(0)
      .default(false)
      .do((undo: RValue) => {
        return r.branch(
          undo,
          r
            .table('MeetingMember')
            .getAll(meetingId, {index: 'meetingId'})
            .update((member: RValue) => ({
              votesRemaining: member('votesRemaining').add(-delta)
            })),
          null
        )
      })
      .run()

    if (hasError) {
      return {error: {message: 'Your team has already spent their votes'}}
    }

    if (maxVotesPerGroup < oldMaxVotesPerGroup) {
      const reflectionGroups = await dataLoader
        .get('retroReflectionGroupsByMeetingId')
        .load(meetingId)

      const maxVotesByASingleUser = Math.max(
        ...reflectionGroups.map(({voterIds}) => mode(voterIds)[0])
      )
      if (maxVotesByASingleUser > maxVotesPerGroup) {
        return {error: {message: 'Your team has already spent their votes'}}
      }
    }

    // RESOLUTION
    try {
      await pg.transaction().execute(async (trx) => {
        const canChangeMaxVotesPerGroup =
          maxVotesPerGroup >= oldMaxVotesPerGroup
            ? true
            : await trx
                .with('GroupVotes', (qb) =>
                  qb
                    .selectFrom('RetroReflectionGroup')
                    .where('meetingId', '=', meetingId)
                    .where('isActive', '=', true)
                    .select(({fn}) => ['id', fn('unnest', ['voterIds']).as('userIds')])
                )
                .with('GroupVoteCount', (qb) =>
                  qb
                    .selectFrom('GroupVotes')
                    .select(({fn}) => ['id', fn.count('userIds').as('mode')])
                    .groupBy(['id', 'userIds'])
                )
                .selectFrom('GroupVoteCount')
                .select(({eb, fn}) => eb(fn.max('mode'), '<', maxVotesPerGroup).as('isValid'))
                .executeTakeFirst()
        if (!canChangeMaxVotesPerGroup) {
          throw new Error('A topic already has too many votes')
        }
        const res = await trx
          .with('MeetingMemberUpdates', (qb) =>
            qb
              .updateTable('MeetingMember')
              .set((eb) => ({votesRemaining: eb('votesRemaining', '+', delta)}))
              .where('meetingId', '=', meetingId)
              // TURN THIS ON IN PHASE 2
              // .$if(delta < 0, (qb) =>
              //   qb.where(({selectFrom, eb}) =>
              //     eb(
              //       selectFrom('MeetingMember')
              //         .select((eb) => eb.fn('min', ['votesRemaining']).as('min'))
              //         .where('meetingId', '=', meetingId),
              //       '>',
              //       -delta
              //     )
              //   )
              // )
              .returning('id')
          )
          .with(
            'NewMeetingUpdates',
            (qb) =>
              qb
                .updateTable('NewMeeting')
                .set({totalVotes, maxVotesPerGroup})
                .where('id', '=', meetingId)
            // TURN THIS ON IN PHASE 2
            // .where(({exists, selectFrom}) => exists(selectFrom('MeetingMemberUpdates').select('id')))
          )
          .updateTable('MeetingSettings')
          .set({
            totalVotes,
            maxVotesPerGroup
          })
          .where('teamId', '=', teamId)
          .where('meetingType', '=', 'retrospective')
          // TURN THIS ON IN PHASE 2
          // .where(({exists, selectFrom}) => exists(selectFrom('MeetingMemberUpdates').select('id')))
          .executeTakeFirstOrThrow()

        if (res.numUpdatedRows === BigInt(0)) {
          throw new Error('Your team has already spent their votes')
        }
      })
    } catch (e) {
      return {error: {message: (e as Error).message}}
    }
    dataLoader.get('newMeetings').clear(meetingId)
    const data = {meetingId}
    publish(SubscriptionChannel.MEETING, meetingId, 'UpdateRetroMaxVotesSuccess', data, subOptions)
    return data
  }
}

export default updateRetroMaxVotes

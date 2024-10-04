import {GraphQLID, GraphQLInt, GraphQLNonNull} from 'graphql'
import {MeetingSettingsThreshold, SubscriptionChannel} from 'parabol-client/types/constEnums'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
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
              .$if(delta < 0, (qb) =>
                qb.where(({selectFrom, eb}) =>
                  eb(
                    selectFrom('MeetingMember')
                      .select((eb) => eb.fn('min', ['votesRemaining']).as('min'))
                      .where('meetingId', '=', meetingId),
                    '>',
                    -delta
                  )
                )
              )
              .returning('id')
          )
          .with('NewMeetingUpdates', (qb) =>
            qb
              .updateTable('NewMeeting')
              .set({totalVotes, maxVotesPerGroup})
              .where('id', '=', meetingId)
              .where(({exists, selectFrom}) =>
                exists(selectFrom('MeetingMemberUpdates').select('id'))
              )
          )
          .updateTable('MeetingSettings')
          .set({
            totalVotes,
            maxVotesPerGroup
          })
          .where('teamId', '=', teamId)
          .where('meetingType', '=', 'retrospective')
          .where(({exists, selectFrom}) => exists(selectFrom('MeetingMemberUpdates').select('id')))
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

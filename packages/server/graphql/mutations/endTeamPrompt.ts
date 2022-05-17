import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import MeetingTeamPrompt from '../../database/types/MeetingTeamPrompt'
import TimelineEventTeamPromptComplete from '../../database/types/TimelineEventTeamPromptComplete'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import EndTeamPromptPayload from '../types/EndTeamPromptPayload'

const endTeamPrompt = {
  type: GraphQLNonNull(EndTeamPromptPayload),
  description: `Finish the team prompt meeting`,
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The meeting to end'
    }
  },
  resolve: async (
    _source: unknown,
    {meetingId}: {meetingId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const meeting = (await dataLoader
      .get('newMeetings')
      .load(meetingId)) as MeetingTeamPrompt | null
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, teamId} = meeting

    // VALIDATION
    if (!isTeamMember(authToken, teamId) && authToken.rol !== 'su') {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})

    // RESOLUTION
    const completedTeamPrompt = (await r
      .table('NewMeeting')
      .get(meetingId)
      .update(
        {
          endedAt: now
        },
        {returnChanges: true}
      )('changes')(0)('new_val')
      .default(null)
      .run()) as unknown as MeetingTeamPrompt
    meeting.endedAt = now

    if (!completedTeamPrompt) {
      return standardError(new Error('Completed team prompt meeting does not exist'), {
        userId: viewerId
      })
    }

    const [team, teamMembers] = await Promise.all([
      dataLoader.get('teams').loadNonNull(teamId),
      dataLoader.get('teamMembersByTeamId').load(teamId)
    ])

    const events = teamMembers.map(
      (teamMember) =>
        new TimelineEventTeamPromptComplete({
          userId: teamMember.userId,
          teamId,
          orgId: team.orgId,
          meetingId
        })
    )
    const timelineEventId = events[0]!.id

    await r.table('TimelineEvent').insert(events).run()

    const data = {
      meetingId,
      teamId,
      timelineEventId
    }
    publish(SubscriptionChannel.TEAM, teamId, 'EndTeamPromptSuccess', data, subOptions)
    return data
  }
}

export default endTeamPrompt

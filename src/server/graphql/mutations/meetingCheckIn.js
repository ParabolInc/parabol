import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import MeetingCheckInPayload from 'server/graphql/types/MeetingCheckInPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {TEAM_MEMBER} from 'universal/utils/constants'
import standardError from 'server/utils/standardError'

export default {
  type: MeetingCheckInPayload,
  description: 'Check a member in as present or absent',
  args: {
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The global teamMemberId of the person who is being checked in'
    },
    isCheckedIn: {
      type: GraphQLBoolean,
      description: 'true if the member is present, false if absent, null if undecided'
    }
  },
  async resolve(source, {teamMemberId, isCheckedIn}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // teamMemberId is of format 'userId::teamId'
    const [, teamId] = teamMemberId.split('::')
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('TeamMember')
      .get(teamMemberId)
      .update({isCheckedIn})

    const data = {teamMemberId}
    publish(TEAM_MEMBER, teamId, MeetingCheckInPayload, data, subOptions)
    return data
  }
}

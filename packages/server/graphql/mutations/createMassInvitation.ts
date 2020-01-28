import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import MassInvitation from '../../database/types/MassInvitation'
import {getUserId, isTeamMember} from '../../utils/authorization'
import CreateMassInvitationPayload from '../types/CreateMassInvitationPayload'

const createMassInvitation = {
  type: GraphQLNonNull(CreateMassInvitationPayload),
  description: `Create a new mass inivtation and optionally void old ones`,
  args: {
    meetingId: {
      type: GraphQLID,
      description: 'the specific meeting where the invite occurred, if any'
    },
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The teamId to create the mass invitation for'
    },
    voidOld: {
      type: GraphQLBoolean,
      description: 'If true, will void all existing mass invitations for the team member'
    }
  },
  resolve: async (_source, {meetingId, teamId, voidOld}, {authToken}) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)

    //AUTH
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: `Not authorized to create mass inivtation for ${teamId}`}}
    }

    // RESOLUTION
    const teamMemberId = toTeamMemberId(teamId, viewerId)
    if (voidOld) {
      await r
        .table('MassInvitation')
        .getAll(teamMemberId, {index: 'teamMemberId'})
        .delete()
        .run()
    }
    const massInvitation = new MassInvitation({meetingId, teamMemberId})

    await r
      .table('MassInvitation')
      .insert(massInvitation, {conflict: 'replace'})
      .run()
    return {teamId}
  }
}

export default createMassInvitation

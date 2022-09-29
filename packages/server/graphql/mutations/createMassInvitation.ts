import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import MassInvitation from '../../database/types/MassInvitation'
import {getUserId, isTeamMember} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import CreateMassInvitationPayload from '../types/CreateMassInvitationPayload'

const createMassInvitation = {
  type: new GraphQLNonNull(CreateMassInvitationPayload),
  description: `Create a new mass inivtation and optionally void old ones`,
  args: {
    meetingId: {
      type: GraphQLID,
      description: 'the specific meeting where the invite occurred, if any'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId to create the mass invitation for'
    },
    voidOld: {
      type: GraphQLBoolean,
      description: 'If true, will void all existing mass invitations for the team member'
    }
  },
  resolve: async (
    _source: unknown,
    {
      meetingId,
      teamId,
      voidOld
    }: {meetingId?: string | null; teamId: string; voidOld?: boolean | null},
    {authToken}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)

    //AUTH
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: `Not authorized to create mass inivtation for ${teamId}`}}
    }

    // RESOLUTION
    const teamMemberId = toTeamMemberId(teamId, viewerId)
    if (voidOld) {
      await r.table('MassInvitation').getAll(teamMemberId, {index: 'teamMemberId'}).delete().run()
    }
    const massInvitation = new MassInvitation({meetingId: meetingId ?? undefined, teamMemberId})

    await r.table('MassInvitation').insert(massInvitation, {conflict: 'replace'}).run()
    return {teamId}
  }
}

export default createMassInvitation

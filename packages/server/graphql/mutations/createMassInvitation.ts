import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {Security, Threshold} from '../../../client/types/constEnums'
import generateRandomString from '../../generateRandomString'
import getKysely from '../../postgres/getKysely'
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
    const pg = getKysely()
    const viewerId = getUserId(authToken)

    //AUTH
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: `Not authorized to create mass inivtation for ${teamId}`}}
    }

    // RESOLUTION
    const teamMemberId = toTeamMemberId(teamId, viewerId)
    if (voidOld) {
      await pg.deleteFrom('MassInvitation').where('teamMemberId', '=', teamMemberId).execute()
    }
    await pg
      .insertInto('MassInvitation')
      .values({
        id: generateRandomString(Security.MASS_INVITATION_TOKEN_LENGTH),
        meetingId,
        teamMemberId,
        expiration: new Date(Date.now() + Threshold.MASS_INVITATION_TOKEN_LIFESPAN)
      })
      .execute()
    return {teamId}
  }
}

export default createMassInvitation

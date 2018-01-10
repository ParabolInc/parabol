import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import getInviterInfoAndTeamName from 'server/graphql/mutations/helpers/inviteTeamMembers/getInviterInfoAndTeamName';
import ResendTeamInvitePayload from 'server/graphql/types/ResendTeamInvitePayload';
import sendTeamInvitations from 'server/safeMutations/sendTeamInvitations';
import {getUserId, requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {INVITATION} from 'universal/utils/constants';

export default {
  name: 'ResendTeamInvite',
  type: ResendTeamInvitePayload,
  description: 'Resend an invitation',
  args: {
    inviteId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the invitation'
    }
  },
  async resolve(source, {inviteId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};
    // AUTH
    const userId = getUserId(authToken);
    const invitation = await r.table('Invitation').get(inviteId);
    if (!invitation) throw new Error('Invitation not found!');

    const {email, fullName, orgId, teamId} = invitation;
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const inviterInfoAndTeamName = await getInviterInfoAndTeamName(teamId, userId);
    const inviter = {
      ...inviterInfoAndTeamName,
      orgId,
      teamId
    };
    const invitees = [{email, fullName}];
    await sendTeamInvitations(invitees, inviter, inviteId);
    const data = {invitationId: inviteId};
    publish(INVITATION, teamId, ResendTeamInvitePayload, data, subOptions);
    return data;
  }
};

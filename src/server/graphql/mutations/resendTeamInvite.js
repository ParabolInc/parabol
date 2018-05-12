import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import getInviterInfoAndTeamName from 'server/graphql/mutations/helpers/inviteTeamMembers/getInviterInfoAndTeamName';
import ResendTeamInvitePayload from 'server/graphql/types/ResendTeamInvitePayload';
import sendTeamInvitations from 'server/safeMutations/sendTeamInvitations';
import {getUserId, isTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {INVITATION} from 'universal/utils/constants';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';
import {sendInvitationNotFoundError} from 'server/utils/docNotFoundErrors';

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
  async resolve (source, {inviteId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};
    // AUTH
    const userId = getUserId(authToken);
    const invitation = await r.table('Invitation').get(inviteId);
    if (!invitation) return sendInvitationNotFoundError(authToken, inviteId);

    const {email, fullName, orgId, teamId} = invitation;
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId);
    }

    // RESOLUTION
    const inviterInfoAndTeamName = await getInviterInfoAndTeamName(teamId, userId);
    const inviter = {
      ...inviterInfoAndTeamName,
      orgId,
      teamId
    };
    const invitees = [{email, fullName}];
    await sendTeamInvitations(invitees, inviter, inviteId, dataLoader);
    const data = {invitationId: inviteId};
    publish(INVITATION, teamId, ResendTeamInvitePayload, data, subOptions);
    return data;
  }
};

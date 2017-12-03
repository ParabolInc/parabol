import {GraphQLBoolean, GraphQLList, GraphQLNonNull} from 'graphql';
import {Invitee} from 'server/graphql/models/Invitation/invitationSchema';
import inviteTeamMembers from 'server/safeMutations/inviteTeamMembers';
import {ensureUniqueId, getUserId, getUserOrgDoc, requireUserInOrg, requireWebsocket} from 'server/utils/authorization';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import {handleSchemaErrors} from 'server/utils/utils';
import createTeamAndLeader from '../createFirstTeam/createTeamAndLeader';
import addTeamValidation from './addTeamValidation';
import TeamInput from 'server/graphql/types/TeamInput';

export default {
  type: GraphQLBoolean,
  description: 'Create a new team and add the first team member',
  args: {
    newTeam: {
      type: new GraphQLNonNull(TeamInput),
      description: 'The new team object'
    },
    invitees: {
      type: new GraphQLList(new GraphQLNonNull(Invitee))
    }
  },
  async resolve(source, args, {authToken, socket}) {
    // AUTH
    const {orgId} = args.newTeam;
    requireWebsocket(socket);
    const userId = getUserId(authToken);
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    requireUserInOrg(userOrgDoc, userId, orgId);

    // VALIDATION
    const {data: {invitees, newTeam}, errors} = addTeamValidation()(args);
    const {id: teamId} = newTeam;
    handleSchemaErrors(errors);
    await ensureUniqueId('Team', teamId);

    // RESOLUTION
    const newAuthToken = {
      ...authToken,
      tms: Array.isArray(authToken.tms) ? authToken.tms.concat(teamId) : [teamId],
      exp: undefined
    };
    socket.setAuthToken(newAuthToken);
    await createTeamAndLeader(userId, newTeam);

    const inviteeCount = invitees && invitees.length || 0;
    sendSegmentEvent('New Team', userId, {teamId, orgId, inviteeCount});

    // handle invitees
    if (inviteeCount > 0) {
      await inviteTeamMembers(invitees, teamId, userId);
    }
    // TODO return a real payload when we move teams to relay
    return true;
  }
};

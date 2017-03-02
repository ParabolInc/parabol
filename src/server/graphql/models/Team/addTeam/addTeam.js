import {
  getUserId,
  getUserOrgDoc,
  isBillingLeader,
  ensureUniqueId,
  requireUserInOrg,
  requireWebsocket
} from 'server/utils/authorization';
import {handleSchemaErrors} from 'server/utils/utils';
import {Invitee} from 'server/graphql/models/Invitation/invitationSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLList
} from 'graphql';
import {TeamInput} from '../teamSchema';
import createTeamAndLeader from '../createFirstTeam/createTeamAndLeader';
import addTeamValidation from './addTeamValidation';
import inviteAsBillingLeader from 'server/graphql/models/Invitation/inviteTeamMembers/inviteAsBillingLeader';
import inviteAsUser from 'server/graphql/models/Invitation/inviteTeamMembers/inviteAsUser';

export default {
  type: GraphQLBoolean,
  description: 'Create a new team and add the first team member',
  args: {
    newTeam: {
      type: new GraphQLNonNull(TeamInput),
      description: 'The new team object with exactly 1 team member'
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
    const {id: teamId, name: teamName} = newTeam;
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

    // handle invitees
    if (!invitees || invitees.length === 0) {
      return true;
    }

    const inviterIsBillingLeader = isBillingLeader(userOrgDoc);

    // sidestep approval process
    if (inviterIsBillingLeader) {
      await inviteAsBillingLeader(invitees, orgId, userId, teamId);
    } else {
      await inviteAsUser(invitees, orgId, userId, teamId, teamName);
    }

    return true;
  }
};

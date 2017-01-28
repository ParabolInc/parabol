import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLList
} from 'graphql';
import {ensureUniqueId, getUserId, requireWebsocket} from 'server/utils/authorization';
import {handleSchemaErrors} from 'server/utils/utils';
import {TeamInput} from 'server/graphql/models/Team/teamSchema';
import {Invitee} from 'server/graphql/models/Invitation/invitationSchema';
import addOrgValidation from 'server/graphql/models/Organization/addOrg/addOrgValidation';
import createTeamAndLeader from 'server/graphql/models/Team/helpers/createTeamAndLeader';
import {asyncInviteTeam} from 'server/graphql/models/Invitation/helpers';

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
    },
    orgName: {
      type: GraphQLString,
      description: 'The name of the new team'
    },
    stripeToken: {
      type: GraphQLString,
      description: 'The CC info for the new team'
    }
  },
  async resolve(source, args, {authToken, socket}) {
    const r = getRethink();

    // AUTH
    const {orgId} = args.newTeam;
    const userId = getUserId(authToken);
    requireWebsocket(socket);

    // VALIDATION
    const {data: {invitees, newTeam, orgName, stripeToken}, errors} = addOrgValidation()(args);
    const {id: teamId} = newTeam;
    handleSchemaErrors(errors);
    const ensureUniqueIds = [
      ensureUniqueId('Team', teamId),
      ensureUniqueId('Organization', orgId)
    ];
    await Promise.all(ensureUniqueIds);

    // RESOLUTION
    await createTeamAndLeader(userId, newTeam, true);
    if (invitees && invitees.length) {
      await asyncInviteTeam(authToken, teamId, invitees);
    }
    const authTokenObj = socket.getAuthToken();
    authTokenObj.tms = Array.isArray(authTokenObj.tms) ? authTokenObj.tms.concat(teamId) : [teamId];
    socket.setAuthToken(authTokenObj);
    return true;
  }
}

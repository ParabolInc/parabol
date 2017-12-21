import {GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql';
import addOrgValidation from 'server/graphql/mutations/helpers/addOrgValidation';
import createNewOrg from 'server/graphql/mutations/helpers/createNewOrg';
import AddOrgPayload from 'server/graphql/types/AddOrgPayload';
import Invitee from 'server/graphql/types/Invitee';
import NewTeamInput from 'server/graphql/types/NewTeamInput';
import inviteTeamMembers from 'server/safeMutations/inviteTeamMembers';
import {ensureUniqueId, getUserId} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import tmsSignToken from 'server/utils/tmsSignToken';
import {handleSchemaErrors} from 'server/utils/utils';
import {NEW_AUTH_TOKEN, ORGANIZATION_ADDED} from 'universal/utils/constants';
import createTeamAndLeader from 'server/graphql/mutations/helpers/createTeamAndLeader';

export default {
  type: AddOrgPayload,
  description: 'Create a new team and add the first team member',
  args: {
    newTeam: {
      type: new GraphQLNonNull(NewTeamInput),
      description: 'The new team object with exactly 1 team member'
    },
    invitees: {
      type: new GraphQLList(new GraphQLNonNull(Invitee))
    },
    orgName: {
      type: GraphQLString,
      description: 'The name of the new team'
    }
  },
  async resolve(source, args, {authToken, dataLoader, socketId}) {
    // AUTH
    const {orgId} = args.newTeam;
    const userId = getUserId(authToken);

    // VALIDATION
    const {data: {invitees, newTeam, orgName}, errors} = addOrgValidation()(args);
    const {id: teamId} = newTeam;
    handleSchemaErrors(errors);
    // this isn't concurrent-safe, but it reduces the risk of conflicting writes
    await Promise.all([
      ensureUniqueId('Team', teamId),
      ensureUniqueId('Organization', orgId)
    ]);

    // RESOLUTION
    const newOrg = await createNewOrg(orgId, orgName, userId);
    await createTeamAndLeader(userId, newTeam, true);

    if (invitees && invitees.length) {
      await inviteTeamMembers(invitees, teamId, userId, dataLoader, socketId);
    }
    const newAuthToken = tmsSignToken({
      ...authToken,
      exp: undefined
    }, authToken.tms.concat(teamId));
    sendSegmentEvent('New Org', userId, {orgId, teamId});
    const organizationAdded = {organization: newOrg};
    getPubSub().publish(`${ORGANIZATION_ADDED}.${userId}`, {organizationAdded, mutatorId: socketId});
    getPubSub().publish(`${NEW_AUTH_TOKEN}.${userId}`, {newAuthToken});
    return organizationAdded;
  }
};

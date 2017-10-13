import {GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql';
import {Invitee} from 'server/graphql/models/Invitation/invitationSchema';
import {TeamInput} from 'server/graphql/models/Team/teamSchema';
import addOrgValidation from 'server/graphql/mutations/helpers/addOrgValidation';
import createNewOrg from 'server/graphql/mutations/helpers/createNewOrg';
import AddOrgPayload from 'server/graphql/types/AddOrgPayload';
import inviteTeamMembers from 'server/safeMutations/inviteTeamMembers';
import {ensureUniqueId, getUserId} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import {handleSchemaErrors} from 'server/utils/utils';
import {NEW_AUTH_TOKEN, ORGANIZATION_ADDED} from 'universal/utils/constants';
import resolvePromiseObj from 'universal/utils/resolvePromiseObj';
import createTeamAndLeader from '../models/Team/createFirstTeam/createTeamAndLeader';
import tmsSignToken from 'server/utils/tmsSignToken';

export default {
  type: AddOrgPayload,
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
    }
  },
  async resolve(source, args, {authToken, socketId}) {
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
    // set the token first because it's on the critical path for UX
    const newAuthToken = tmsSignToken({
      ...authToken,
      tms: authToken.tms.concat(teamId),
      exp: undefined
    });
    getPubSub().publish(`${NEW_AUTH_TOKEN}.${userId}`, newAuthToken);

    const {newOrg} = await resolvePromiseObj({
      newTeam: createTeamAndLeader(userId, newTeam, true),
      newOrg: createNewOrg(orgId, orgName, userId)
    });

    if (invitees && invitees.length) {
      await inviteTeamMembers(invitees, teamId, userId);
    }
    sendSegmentEvent('New Org', userId, {orgId, teamId});
    const organizationAdded = {organization: newOrg};
    getPubSub().publish(`${ORGANIZATION_ADDED}.${userId}`, {organizationAdded, mutatorId: socketId});
    return organizationAdded;
  }
};

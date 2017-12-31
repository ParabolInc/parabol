import {GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql';
import addOrgValidation from 'server/graphql/mutations/helpers/addOrgValidation';
import createNewOrg from 'server/graphql/mutations/helpers/createNewOrg';
import createTeamAndLeader from 'server/graphql/mutations/helpers/createTeamAndLeader';
import handleNewTeamInvitees from 'server/graphql/mutations/helpers/handleNewTeamInvitees';
import AddOrgPayload from 'server/graphql/types/AddOrgPayload';
import Invitee from 'server/graphql/types/Invitee';
import NewTeamInput from 'server/graphql/types/NewTeamInput';
import {getUserId} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import tmsSignToken from 'server/utils/tmsSignToken';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {NEW_AUTH_TOKEN, ORGANIZATION_ADDED} from 'universal/utils/constants';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

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
  async resolve(source, args, {authToken, dataLoader, socketId: mutatorId}) {
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    const userId = getUserId(authToken);

    // VALIDATION
    const {data: {invitees, newTeam, orgName}, errors} = addOrgValidation()(args);
    handleSchemaErrors(errors);

    // RESOLUTION
    const orgId = shortid.generate();
    const teamId = shortid.generate();
    const newOrg = await createNewOrg(orgId, orgName, userId);
    await createTeamAndLeader(userId, {id: teamId, ...newTeam}, true);

    const invitationIds = await handleNewTeamInvitees(invitees, teamId, userId, subOptions);

    const newAuthToken = tmsSignToken({
      ...authToken,
      exp: undefined
    }, authToken.tms.concat(teamId));
    sendSegmentEvent('New Org', userId, {orgId, teamId});
    const organizationAdded = {organization: newOrg};
    getPubSub().publish(`${ORGANIZATION_ADDED}.${userId}`, {organizationAdded, ...subOptions});
    getPubSub().publish(`${NEW_AUTH_TOKEN}.${userId}`, {newAuthToken});

    return {
      orgId,
      teamId,
      teamMemberId: toTeamMemberId(teamId, userId),
      invitationIds
    };
  }
};

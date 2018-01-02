import {GraphQLList, GraphQLNonNull} from 'graphql';
import createTeamAndLeader from 'server/graphql/mutations/helpers/createTeamAndLeader';
import handleNewTeamInvitees from 'server/graphql/mutations/helpers/handleNewTeamInvitees';
import AddTeamPayload from 'server/graphql/types/AddTeamPayload';
import Invitee from 'server/graphql/types/Invitee';
import NewTeamInput from 'server/graphql/types/NewTeamInput';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {getUserId, getUserOrgDoc, requireUserInOrg} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {ADDED, NEW_AUTH_TOKEN, TEAM, UPDATED} from 'universal/utils/constants';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';
import addTeamValidation from './helpers/addTeamValidation';

export default {
  type: AddTeamPayload,
  description: 'Create a new team and add the first team member',
  args: {
    newTeam: {
      type: new GraphQLNonNull(NewTeamInput),
      description: 'The new team object'
    },
    invitees: {
      type: new GraphQLList(new GraphQLNonNull(Invitee))
    }
  },
  async resolve(source, args, {authToken, dataLoader, socketId: mutatorId}) {
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    const {orgId} = args.newTeam;
    const userId = getUserId(authToken);
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    requireUserInOrg(userOrgDoc, userId, orgId);

    // VALIDATION
    const {data: {invitees, newTeam}, errors} = addTeamValidation()(args);
    handleSchemaErrors(errors);

    // RESOLUTION
    const teamId = shortid.generate();
    await createTeamAndLeader(userId, {id: teamId, ...newTeam});
    const inviteeCount = invitees && invitees.length || 0;

    // handle invitees
    sendSegmentEvent('New Team', userId, {teamId, orgId, inviteeCount});

    const invitationIds = await handleNewTeamInvitees(invitees, teamId, userId, subOptions);

    publish(TEAM, userId, ADDED, {teamId}, subOptions);
    const oldTMS = authToken.tms || [];
    const tms = oldTMS.concat(teamId);
    auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms});
    publish(NEW_AUTH_TOKEN, userId, UPDATED, {tms});
    return {
      teamId,
      teamMemberId: toTeamMemberId(teamId, userId),
      invitationIds
    };
  }
};

import {GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql';
import addOrgValidation from 'server/graphql/mutations/helpers/addOrgValidation';
import createNewOrg from 'server/graphql/mutations/helpers/createNewOrg';
import createTeamAndLeader from 'server/graphql/mutations/helpers/createTeamAndLeader';
import AddOrgPayload from 'server/graphql/types/AddOrgPayload';
import Invitee from 'server/graphql/types/Invitee';
import NewTeamInput from 'server/graphql/types/NewTeamInput';
import inviteTeamMembers from 'server/safeMutations/inviteTeamMembers';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {getUserId} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {NEW_AUTH_TOKEN, NOTIFICATION, ORGANIZATION, UPDATED} from 'universal/utils/constants';
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
    const viewerId = getUserId(authToken);

    // VALIDATION
    const {data: {invitees, newTeam, orgName}, errors} = addOrgValidation()(args);
    handleSchemaErrors(errors);

    // RESOLUTION
    const orgId = shortid.generate();
    const teamId = shortid.generate();
    await createNewOrg(orgId, orgName, viewerId);
    await createTeamAndLeader(viewerId, {id: teamId, orgId, ...newTeam}, true);

    const tms = authToken.tms.concat(teamId);
    const inviteeCount = invitees ? invitees.length : 0;
    sendSegmentEvent('New Org', viewerId, {orgId, teamId, inviteeCount});
    publish(NEW_AUTH_TOKEN, viewerId, UPDATED, {tms});
    auth0ManagementClient.users.updateAppMetadata({id: viewerId}, {tms});

    const teamMemberId = toTeamMemberId(teamId, viewerId);
    const data = {orgId, teamId, teamMemberId};

    if (inviteeCount > 0) {
      const {teamInviteNotifications, newInvitations} = await inviteTeamMembers(invitees, teamId, viewerId);
      // mutative!
      data.teamInviteNotifications = teamInviteNotifications;
      data.invitationIds = newInvitations.map(({id}) => id);
      teamInviteNotifications.forEach((notification) => {
        const {userIds} = notification;
        const invitedUserId = userIds[0];
        publish(NOTIFICATION, invitedUserId, AddOrgPayload, data, subOptions);
      });
    }

    publish(ORGANIZATION, viewerId, AddOrgPayload, data, subOptions);


    return data;
  }
};

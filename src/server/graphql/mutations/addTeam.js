import {GraphQLList, GraphQLNonNull} from 'graphql';
import createTeamAndLeader from 'server/graphql/mutations/helpers/createTeamAndLeader';
import AddTeamPayload from 'server/graphql/types/AddTeamPayload';
import Invitee from 'server/graphql/types/Invitee';
import NewTeamInput from 'server/graphql/types/NewTeamInput';
import inviteTeamMembers from 'server/safeMutations/inviteTeamMembers';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {getUserId, getUserOrgDoc, requireUserInOrg} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {NEW_AUTH_TOKEN, NOTIFICATION, TEAM, UPDATED} from 'universal/utils/constants';
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
    const viewerId = getUserId(authToken);
    const userOrgDoc = await getUserOrgDoc(viewerId, orgId);
    requireUserInOrg(userOrgDoc, viewerId, orgId);

    // VALIDATION
    const {data: {invitees, newTeam}, errors} = addTeamValidation()(args);
    handleSchemaErrors(errors);

    // RESOLUTION
    const teamId = shortid.generate();
    await createTeamAndLeader(viewerId, {id: teamId, ...newTeam});

    const tms = authToken.tms.concat(teamId);
    const inviteeCount = invitees ? invitees.length : 0;
    sendSegmentEvent('New Team', viewerId, {orgId, teamId, inviteeCount});
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
        const {userIds: [invitedUserId]} = notification;
        publish(NOTIFICATION, invitedUserId, AddTeamPayload, data, subOptions);
      });
    }

    publish(TEAM, viewerId, AddTeamPayload, data, subOptions);

    return data;
  }
};

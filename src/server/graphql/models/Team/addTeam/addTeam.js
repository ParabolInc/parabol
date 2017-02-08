import getRethink from 'server/database/rethinkDriver';
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
import asyncInviteTeam from 'server/graphql/models/Invitation/inviteTeamMembers/asyncInviteTeam';
import createTeamAndLeader from '../createFirstTeam/createTeamAndLeader';
import addTeamValidation from './addTeamValidation';
import createPendingApprovals from 'server/graphql/models/Invitation/inviteTeamMembers/createPendingApprovals';
import inviteAsBillingLeader from 'server/graphql/models/Invitation/inviteTeamMembers/inviteAsBillingLeader';

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
    const r = getRethink();
    const now = new Date();
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
    const newAuthTokenObj = {
      ...authToken,
      tms: Array.isArray(authToken.tms) ? authToken.tms.concat(teamId) : [teamId],
      exp: undefined
    };
    socket.setAuthToken(newAuthTokenObj);
    await createTeamAndLeader(userId, newTeam);

    //handle invitees
    if (!invitees || invitees.length === 0) {
      return true
    }

    const inviterIsBillingLeader = isBillingLeader(userOrgDoc);

    // sidestep approval process
    if (inviterIsBillingLeader) {
      await inviteAsBillingLeader(invitees, orgId, authToken, teamId);
      return true;
    }
    const inviteeEmails = invitees.map((i) => i.email);
    // send invitation that don't need approval
    const inOrgInvitees = await r.table('User')
      .getAll(orgId, {index: 'userOrgs'})
      .filter((user) => r.expr(inviteeEmails).contains(user('email')))
      .merge((user) => ({
        fullName: user('preferredName')
      }))
      .pluck('fullName', 'email');
    if (inOrgInvitees.length > 0) {
      await asyncInviteTeam(authToken, teamId, inOrgInvitees);
    }

    // seek approval for the rest
    const outOfOrgEmails = inviteeEmails.filter((email) => !inOrgInvitees.find((i) => i.email === email));
    if (outOfOrgEmails.length) {
      await createPendingApprovals(outOfOrgEmails, orgId, teamId, teamName);

    }
    return true;
  }
}

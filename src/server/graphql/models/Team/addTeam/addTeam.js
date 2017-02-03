import getRethink from 'server/database/rethinkDriver';
import {
  getUserId,
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
import {asyncInviteTeam} from 'server/graphql/models/Invitation/helpers';
import shortid from 'shortid';
import createTeamAndLeader from '../helpers/createTeamAndLeader';
import makeAddTeamServerSchema from 'universal/validation/makeAddTeamServerSchema';
import {BILLING_LEADER, REQUEST_NEW_USER} from 'universal/utils/constants';


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

    // AUTH
    const {orgId} = args.newTeam;
    const userId = getUserId(authToken);
    requireWebsocket(socket);
    await requireUserInOrg(userId, orgId);

    // VALIDATION
    const schema = makeAddTeamServerSchema({inviteEmails: [], teamMemberEmails: []});
    const {data: {invitees, newTeam}, errors} = schema(args);
    const {id: teamId, name: teamName} = newTeam;
    handleSchemaErrors(errors);
    await ensureUniqueId('Team', teamId);

    // RESOLUTION
    const authTokenObj = socket.getAuthToken();
    const newAuthTokenObj = {
      ...authTokenObj,
      tms: Array.isArray(authTokenObj.tms) ? authTokenObj.tms.concat(teamId) : [teamId],
      exp: undefined
    };
    socket.setAuthToken(newAuthTokenObj);
    await createTeamAndLeader(userId, newTeam);
    if (invitees && invitees.length) {
      const inviterIsBillingLeader = await isBillingLeader(userId, orgId);

      if (inviterIsBillingLeader) {
        await asyncInviteTeam(authToken, teamId, invitees);
        return true;
      }
      const inviteeEmails = invitees.map((i) => i.email);
      const inOrgInvitees = await r.table('User')
        .getAll(orgId, {index: 'userOrgs'})
        .filter((user) => r.expr(inviteeEmails).contains(user('email')))
        .merge({
          fullName: user('preferredName')
        })
        .pluck('fullName', 'email');
      if (inOrgInvitees.length > 0) {
        await asyncInviteTeam(authToken, teamId, inOrgInvitees);
      }
      const outOfOrgEmails = inviteeEmails.filter((email) => !inOrgInvitees.find((i) => i.email === email));

      // remove the emails that are already pending org leader approval
      const emailsWithNotifications = await r.table('Notification')
        .getAll(orgId, {index: 'orgId'})
        .filter({
          type: REQUEST_NEW_USER
        })('varList')
        // varList(2) is the email field
        .map((varList) => varList(2));
      const newOutOfOrgEmails = outOfOrgEmails.filter((email) => !emailsWithNotifications.find((oldEmail) => oldEmail === email));
      if (newOutOfOrgEmails.length) {
        // add a notification to the billing leaders
        const {userIds, inviter} = await r.table('User')
          .getAll(orgId, {index: 'userOrgs'})
          .filter((user) => user('userOrgs')
            .contains((userOrg) => userOrg('id').eq(id).and(userOrg('role').eq(BILLING_LEADER))))('id')
          .do((userIds) => {
            return {
              userIds,
              inviter: r.table('User').get(userId).pluck('preferredName', 'id')
            }
          });
        const notificationIds = newOutOfOrgEmails.reduce((obj, email) => {
          obj[email] = shortid.generate();
          return obj;
        }, {});
        // send a new notification to each billing leader concerning each out-of-org invitee
        await r.expr(newOutOfOrgEmails)
          .forEach((inviteeEmail) => {
            return r.table('Notification')
              .insert({
                id: r.expr(notificationIds)(inviteeEmail),
                type: REQUEST_NEW_USER,
                startAt: new Date(),
                orgId,
                userIds,
                varList: [inviter.id, inviter.preferredName, inviteeEmail, teamId, teamName]
              })
          });
      }
    }
    return true;
  }
}

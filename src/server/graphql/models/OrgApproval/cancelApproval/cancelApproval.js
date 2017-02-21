import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean,
} from 'graphql';
import {requireWebsocket, requireSUOrTeamMember} from 'server/utils/authorization';
import {REQUEST_NEW_USER} from 'universal/utils/constants';

export default {
  type: GraphQLBoolean,
  description: 'Create a new team and add the first team member',
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'org approval id to cancel'
    }
  },
  async resolve(source, {id}, {authToken, socket}) {
    const r = getRethink();

    // AUTH
    const orgApproval = await r.table('OrgApproval').get(id);
    const {email, orgId, teamId} = orgApproval;
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);

    // RESOLUTION
    await r.table('OrgApproval').get(id).delete()
      .do(() => {
        // removal notifications concerning the approval
        return r.table('Notification')
          .getAll(orgId, {index: 'orgId'})
          .filter({
            type: REQUEST_NEW_USER
          })
          .filter((notification) => {
            return notification('varList')(2).eq(email).and(notification('varList')(3).eq(teamId));
          })
          .delete();
      });
    return true;
  }
};

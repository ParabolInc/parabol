import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import NotificationsClearedPayload from 'server/graphql/types/NotificationsClearedPayload';
import approveToOrg from 'server/safeMutations/approveToOrg';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';


export default {
  type: new GraphQLNonNull(NotificationsClearedPayload),
  description: 'Approve an outsider to join the organization',
  args: {
    email: {
      type: new GraphQLNonNull(GraphQLString)
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(source, {email, orgId}, {authToken, socket}) {
    // AUTH
    const userId = getUserId(authToken);
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    requireOrgLeader(userOrgDoc);

    return approveToOrg(email, orgId, userId, socket.id);
  }
};


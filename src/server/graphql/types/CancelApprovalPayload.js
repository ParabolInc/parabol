import {GraphQLList, GraphQLObjectType} from 'graphql';
import {resolveArchivedSoftTasks, resolveOrgApproval, resolveSoftTeamMember} from 'server/graphql/resolvers';
import NotifyRequestNewUser from 'server/graphql/types/NotifyRequestNewUser';
import OrgApproval from 'server/graphql/types/OrgApproval';
import SoftTeamMember from 'server/graphql/types/SoftTeamMember';
import Task from 'server/graphql/types/Task';

const CancelApprovalPayload = new GraphQLObjectType({
  name: 'CancelApprovalPayload',
  fields: () => ({
    orgApproval: {
      type: OrgApproval,
      description: 'The inactivated org approval',
      resolve: resolveOrgApproval
    },
    removedRequestNotification: {
      type: NotifyRequestNewUser,
      description: 'The notification requesting org approval to the org leader'
    },
    removedSoftTeamMember: {
      type: SoftTeamMember,
      description: 'The soft team members that are no longer tentatively on the team',
      resolve: resolveSoftTeamMember
    },
    archivedSoftTasks: {
      type: new GraphQLList(Task),
      description: 'The tasks that belonged to the soft team member',
      resolve: resolveArchivedSoftTasks
    }
  })
});

export default CancelApprovalPayload;

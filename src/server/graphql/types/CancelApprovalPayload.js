import {GraphQLList, GraphQLObjectType} from 'graphql';
import {resolveOrgApproval, resolveSoftTeamMember} from 'server/graphql/resolvers';
import NotifyRequestNewUser from 'server/graphql/types/NotifyRequestNewUser';
import OrgApproval from 'server/graphql/types/OrgApproval';
import SoftTeamMember from 'server/graphql/types/SoftTeamMember';
import Project from 'server/graphql/types/Project';

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
    archivedSoftProjects: {
      type: new GraphQLList(Project),
      description: 'The projects that belonged to the soft team member',
      resolve: async ({archivedSoftProjectIds}, args, {authToken, dataLoader}) => {
        const {tms} = authToken;
        const softProjects = await dataLoader.get('projects').loadMany(archivedSoftProjectIds);
        return softProjects.filter(({teamId}) => tms.includes(teamId));
      }
    }
  })
});

export default CancelApprovalPayload;

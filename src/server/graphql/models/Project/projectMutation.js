import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {PROJECT_CREATED} from 'universal/utils/constants';

export default {
  deleteProject: {
    type: GraphQLBoolean,
    description: 'Delete (not archive!) a project',
    args: {
      projectId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The projectId (teamId::shortid) to delete'
      }
    },
    async resolve(source, {projectId}, {authToken}) {
      const r = getRethink();

      // AUTH
      const userId = getUserId(authToken);
      // format of id is teamId::taskIdPart
      const [teamId] = projectId.split('::');
      requireSUOrTeamMember(authToken, teamId);

      // RESOLUTION
      const {project} = await r({
        project: r.table('Project').get(projectId).delete({returnChanges: true})('changes')(0)('old_val').default(null),
        projectHistory: r.table('ProjectHistory')
          .between([projectId, r.minval], [projectId, r.maxval], {index: 'projectIdUpdatedAt'})
          .delete()
      });
      if (!project) {
        throw new Error('Project does not exist');
      }
      const projectDeleted = {project};
      getPubSub().publish(`${PROJECT_CREATED}.${teamId}`, {projectDeleted});
      getPubSub().publish(`${PROJECT_CREATED}.${userId}`, {projectDeleted});
      return projectDeleted;
    }
  }
};

import getRethink from 'server/database/rethinkDriver';
import {ProjectInput} from './projectSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} from 'graphql';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import shortid from 'shortid';
import makeProjectSchema from 'universal/validation/makeProjectSchema';
import {handleSchemaErrors} from 'server/utils/utils';
import updateProject from 'server/graphql/models/Project/updateProject/updateProject';

export default {
  updateProject,
  createProject: {
    type: GraphQLBoolean,
    description: 'Create a new project, triggering a CreateCard for other viewers',
    args: {
      newProject: {
        type: new GraphQLNonNull(ProjectInput),
        description: 'The new project including an id, status, and type, and teamMemberId'
      }
    },
    async resolve(source, {newProject}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      // format of id is teamId::taskIdPart
      requireWebsocket(socket);
      const [teamId] = newProject.id.split('::');
      requireSUOrTeamMember(authToken, teamId);

      // VALIDATION
      // TODO make id, status, teamMemberId required
      const schema = makeProjectSchema();
      const {errors, data: validNewProject} = schema(newProject);
      handleSchemaErrors(errors);

      // RESOLUTION
      const now = new Date();
      const [userId] = validNewProject.teamMemberId.split('::');
      const project = {
        ...validNewProject,
        isArchived: false,
        userId,
        createdAt: now,
        createdBy: authToken.sub,
        teamId,
        updatedAt: now
      };
      await r.table('Project').insert(project)
        .do(() => {
          return r.table('ProjectHistory').insert({
            id: shortid.generate(),
            content: project.content,
            projectId: project.id,
            status: project.status,
            teamMemberId: project.teamMemberId,
            updatedAt: project.updatedAt
          });
        });
    }
  },
  deleteProject: {
    type: GraphQLBoolean,
    description: 'Delete (not archive!) a project',
    args: {
      projectId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The projectId (teamId::shortid) to delete'
      }
    },
    async resolve(source, {projectId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      // format of id is teamId::taskIdPart
      const [teamId] = projectId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // RESOLUTION
      await r.table('Project').get(projectId).delete()
        .do(() => {
          return r.table('ProjectHistory')
            .between([projectId, r.minval], [projectId, r.maxval], {index: 'projectIdUpdatedAt'})
            .delete();
        });
    }
  },
  makeAction: {
    type: GraphQLBoolean,
    description: 'Turn a project into an action',
    args: {
      projectId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The projectId (teamId::shortid) to delete'
      }
    },
    async resolve(source, {projectId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      // format of id is teamId::taskIdPart
      const [teamId] = projectId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // RESOLUTION
      const project = await r.table('Project').get(projectId);
      const now = new Date();
      const [userId] = project.teamMemberId.split('::');
      const newAction = {
        id: projectId,
        content: project.content,
        userId,
        teamMemberId: project.teamMemberId,
        isComplete: false,
        createdAt: project.createdAt,
        updatedAt: now,
        sortOrder: 0,
        agendaId: project.agendaId
      };
      await r.table('Action').insert(newAction)
        .do(() => {
          return r.table('Project').get(projectId).delete();
        });
    }
  }
};

import getRethink from 'server/database/rethinkDriver';
import {CreateProjectInput, UpdateProjectInput} from './projectSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLString,
  GraphQLID
} from 'graphql';
import {requireSUOrTeamMember} from '../authorization';
import rebalanceProject from './rebalanceProject';

export default {
  updateProject: {
    type: GraphQLBoolean,
    description: 'Update a project with a change in content, ownership, or status',
    args: {
      updatedProject: {
        type: new GraphQLNonNull(UpdateProjectInput),
        description: 'the updated project including the id, and at least one other field'
      },
      rebalance: {
        type: GraphQLString,
        description: 'the name of a status if the sort order got so out of whack that we need to reset the btree'
      }
    },
    async resolve(source, {updatedProject, rebalance}, {authToken}) {
      const r = getRethink();
      const {id, ...project} = updatedProject;
      // id is of format 'teamId::taskId'
      const [teamId] = id.split('::');
      requireSUOrTeamMember(authToken, teamId);
      const now = new Date();
      const newProject = {
        ...project,
        updatedAt: now
      };
      const {teamMemberId} = project;
      if (teamMemberId) {
        const [userId] = teamMemberId.split('::');
        newProject.userId = userId;
      }
      // we could possibly combine this into the rebalance if we did a resort on the server, but separate logic is nice
      await r.table('Project').get(id).update(newProject);
      if (rebalance) {
        await rebalanceProject(rebalance, teamId);
      }
      return true;
    }
  },
  createProject: {
    type: GraphQLBoolean,
    description: 'Create a new project, triggering a CreateCard for other viewers',
    args: {
      newProject: {
        type: new GraphQLNonNull(CreateProjectInput),
        description: 'The new project including an id, status, and type, and teamMemberId'
      }
    },
    async resolve(source, {newProject}, {authToken}) {
      const r = getRethink();
      const {id} = newProject;
      // format of id is teamId::taskIdPart
      const [teamId] = id.split('::');
      requireSUOrTeamMember(authToken, teamId);
      const now = new Date();
      const [userId] = newProject.teamMemberId.split('::');
      const project = {
        ...newProject,
        isArchived: false,
        userId,
        createdAt: now,
        createdBy: authToken.sub,
        teamId,
        updatedAt: now
      };
      await r.table('Project').insert(project);
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
    async resolve(source, {projectId}, {authToken}) {
      const r = getRethink();
      // format of id is teamId::taskIdPart
      const [teamId] = projectId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      await r.table('Project').get(projectId).delete();
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
    async resolve(source, {projectId}, {authToken}) {
      const r = getRethink();
      // format of id is teamId::taskIdPart
      const [teamId] = projectId.split('::');
      requireSUOrTeamMember(authToken, teamId);
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

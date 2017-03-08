import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} from 'graphql';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';

export default {
  type: GraphQLBoolean,
  description: 'Turn an action into a project',
  args: {
    actionId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The actionId (teamId::shortid) to delete'
    }
  },
  async resolve(source, {actionId}, {authToken, socket}) {
    const r = getRethink();

    // AUTH
    requireWebsocket(socket);
    const [teamId] = actionId.split('::');
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const action = await r.table('Action').get(actionId);
    const now = new Date();
    const newProject = {
      id: actionId,
      content: action.content,
      isArchived: false,
      teamId,
      teamMemberId: action.teamMemberId,
      createdAt: action.createdAt,
      updatedAt: now,
      status: 'active',
      sortOrder: 0,
      agendaId: action.agendaId
    };
    await r.table('Project').insert(newProject)
      .do(() => {
        return r.table('Action').get(actionId).delete();
      });
  }
};

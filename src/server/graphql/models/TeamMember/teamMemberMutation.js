import { TeamMember } from './teamMemberSchema';
import r from '../../../database/rethinkDriver';
import uuid from 'node-uuid';
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

export default {
  createTeamMember: {
    type: TeamMember,
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the id of the team the member belongs to'
      },
      name: {
        type: GraphQLString,
        description: 'the team member\'s name'
      },
      email: {
        type: GraphQLString,
        description: 'the team member\'s email'
      }
    },
    async resolve(source, {teamId, name, email}) {
      const newTeamMember = {
        // TODO: a uuid is overkill. let's make it small for smaller urls & friendly socket payloads
        id: uuid.v4(),
        teamId,
        name,
        email
      };
      await r.table('TeamMember').insert(newTeamMember);
      return newTeamMember;
    }
  }
};

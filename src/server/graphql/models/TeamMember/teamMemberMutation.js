import {TeamMember, TeamMemberInput} from './teamMemberSchema';
import r from '../../../database/rethinkDriver';
import shortid from 'shortid';
import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

export default {
  createTeamMember: {
    type: TeamMember,
    args: {
      newTeamMember: {
        type: new GraphQLNonNull(TeamMemberInput),
        description: 'the new team member object'
      }
    },
    async resolve(source, {newTeamMember}, {authToken}) {
      const completeTeamMember = {...newTeamMember, cachedUserId: authToken.sub}
      r.table('TeamMember').insert(newTeamMember);
      return newTeamMember;
    }
  }
};

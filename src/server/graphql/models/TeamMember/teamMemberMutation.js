import r from '../../../database/rethinkDriver';
import {TeamMember, TeamMemberInput, InviteesInput} from './teamMemberSchema';
import shortid from 'shortid';
import {
  GraphQLNonNull,
  GraphQLBoolean
} from 'graphql';
import sendEmail from '../../../email/sendEmail';
import {requireSUOrTeamMember} from '../authorization';

export default {
  acceptInvitation: {
    type: TeamMember,
    args: {
      inviteToken: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The invite token from an email'
      }
    },
    async resolve(source, {newTeamMember}, {authToken}) {
      // TODO complete all invitations for the given email address
      // const completeTeamMember = {...newTeamMember, cachedUserId: authToken.sub, isActive: true}
      // r.table('TeamMember').insert(completeTeamMember);
      // return newTeamMember;
    }
  }
};

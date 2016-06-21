import r from '../../../database/rethinkDriver';
import {TeamMember, TeamMemberInput, InviteesInput} from './teamMemberSchema';
import shortid from 'shortid';
import {
  GraphQLNonNull,
GraphQLBoolean
} from 'graphql';
import sendEmail from '../../../email/sendEmail';

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
      const completeTeamMember = {...newTeamMember, cachedUserId: authToken.sub, isActive: true}
      r.table('TeamMember').insert(completeTeamMember);
      return newTeamMember;
    }
  },
  inviteTeamMembers: {
    type: GraphQLBoolean,
    description: 'Send invitation emails to a list of email addresses',
    args: {
      invitees: {
        type: new GraphQLNonNull(InviteesInput)
      }
    },
    resolve(source, {invitees}) {
      const {teamId, ...inviteeList} = invitees;
      const teamName = r.table('Team').get(teamId);

      // TODO i'm betting mailgun has better email validation than we do & will return bounced emails. let's catch em!
      inviteeList.forEach(invitee => {
        const inviteId = shortid.generate();
        const newEmail = {...invitee, teamName, inviteId};
        // TODO maybe we should be receiving isFacilitator/isLead?
        r.table('TeamMember').insert({
          id: shortid.generate(),
          isActive: false,
          teamId,
          inviteId
        });
        sendEmail('inviteTeamMember', newEmail);
      });
      return true;
    }
  }
};

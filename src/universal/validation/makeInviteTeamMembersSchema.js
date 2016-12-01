import {emailRegex} from 'universal/validation/regex';
import legitify from './legitify';
import {fullName, task} from 'universal/validation/templates';

export default function makeInviteTeamMembersSchema(props) {
  const {inviteEmails, teamMemberEmails} = props;
  return legitify({
    invitees: [{
      email: (value) => value
        .trim()
        .required('You should enter an email here')
        .matches(emailRegex, 'That doesn\'t look like an email address')
        .min(2, 'That name is too short!')
        .max(10, 'That name is too long!')
        .test((inviteTeamMember) => {
          return inviteEmails.includes(inviteTeamMember) && 'That person has already been invited!'
        })
        .test((inviteTeamMember) => teamMemberEmails.includes(inviteTeamMember) && 'That person is already on your team!'),
      fullName,
      task
    }]
  })
};

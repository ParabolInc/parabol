import {emailRegex} from 'universal/validation/regex';
import legitify from './legitify';

export default function makeInviteTeamMemberSchema(props, fieldName) {
  const {inviteEmails, teamMemberEmails} = props;
  return legitify({
    [fieldName]: (value) => value
      .required('You should enter an email here')
      .matches(emailRegex, 'That doesn\'t look like an email address')
      .min(2, 'That name is too short!')
      .max(10, 'That name is too long!')
      .test((inviteTeamMember) => {
        return inviteEmails.includes(inviteTeamMember) && 'That person has already been invited!'
      })
      .test((inviteTeamMember) => teamMemberEmails.includes(inviteTeamMember) && 'That person is already on your team!')
  })
};

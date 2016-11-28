import {emailRegex} from 'universal/validation/regex';

export default function makeInviteTeamMemberSchema(props, fieldName) {
  const {inviteEmails, teamMemberEmails} = props;
  return {
    [fieldName]: (value) => value
      .required('You should enter an email here')
      .matches(emailRegex, 'That doesn\'t look like an email address')
      .min(2, 'That name is too short!')
      .max(10, 'That name is too long!')
      .true((inviteTeamMember) => !inviteEmails.includes(inviteTeamMember),
        'That person has already been invited!')
      .true((inviteTeamMember) => !teamMemberEmails.includes(inviteTeamMember),
        'That person is already on your team!')
  }
};

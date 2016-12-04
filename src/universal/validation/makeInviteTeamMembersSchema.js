import legitify from './legitify';
import {fullName, makeInviteeTemplate, task} from 'universal/validation/templates';

export default function makeInviteTeamMembersSchema(props) {
  const {inviteEmails, teamMemberEmails} = props;
  return legitify([{
    email: makeInviteeTemplate(inviteEmails, teamMemberEmails),
    fullName,
    task
  }]);
}

import legitify from 'universal/validation/legitify';
import {fullName, makeInviteeTemplate, task} from 'universal/validation/templates';

export default function inviteTeamMemberValidation(props) {
  const {inviteEmails, activeTeamMemberEmails} = props;
  return legitify([{
    email: makeInviteeTemplate(inviteEmails, activeTeamMemberEmails),
    fullName,
    task
  }]);
}

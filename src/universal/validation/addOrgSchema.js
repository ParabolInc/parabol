import legitify from './legitify';
import {inviteesRaw, orgName, teamName} from 'universal/validation/templates';
import {idRegex} from 'universal/validation/regex';

export default function addOrgSchema() {
  return legitify({
    inviteesRaw,
    teamName,
    orgName,
    stripeToken: (value) => value
      .required('Don\'t forget to add your credit card')
      .matches(idRegex)
  });
}

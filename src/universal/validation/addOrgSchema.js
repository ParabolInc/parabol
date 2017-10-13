import {inviteesRaw, orgName, teamName} from 'universal/validation/templates';
import legitify from './legitify';

export default function addOrgSchema() {
  return legitify({
    inviteesRaw,
    teamName,
    orgName
  });
}

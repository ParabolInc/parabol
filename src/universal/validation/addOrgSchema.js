import legitify from './legitify';
import {inviteesRaw, orgName, teamName} from 'universal/validation/templates';

export default function addOrgSchema() {
  return legitify({
    inviteesRaw,
    teamName,
    orgName,
  });
}

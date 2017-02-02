import legitify from './legitify';
import {inviteesRaw, teamName, requiredId} from 'universal/validation/templates';

export default function makeAddTeamSchema() {
  return legitify({
    inviteesRaw,
    teamName,
    orgId: requiredId
  });
}

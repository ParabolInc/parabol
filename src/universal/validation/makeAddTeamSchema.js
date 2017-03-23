import {inviteesRaw, teamName, requiredId} from 'universal/validation/templates';
import legitify from './legitify';

export default function makeAddTeamSchema() {
  return legitify({
    inviteesRaw,
    teamName,
    orgId: requiredId
  });
}

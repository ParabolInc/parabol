import legitify from './legitify';
import {inviteesRaw, teamName} from 'universal/validation/templates';

export default function makeAddTeamSchema() {
  return legitify({
    inviteesRaw,
    teamName
  });
}

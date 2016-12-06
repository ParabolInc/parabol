import {id, teamName} from 'universal/validation/templates';
import legitify from './legitify';

export default function makeStep2Schema(teamNameField = 'name') {
  return legitify({
    id,
    [teamNameField]: teamName
  });
}

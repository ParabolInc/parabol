import {id} from 'universal/validation/templates';
import legitify from './legitify';

export default function makeStep2Schema(teamNameField = 'name') {
  return legitify({
    id,
    [teamNameField]: (value) => value
      .trim()
      .required('"The nameless wonder" is better than nothing')
      .min(2, 'The "A Team" had a longer name than that')
      .max(50, 'That isn\'t very memorable. Maybe shorten it up?')
  });
}

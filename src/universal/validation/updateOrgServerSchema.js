import {id, teamName, url} from 'universal/validation/templates';
import legitify from './legitify';

export default function updateOrgServerSchema(orgName = 'name') {
  return legitify({
    id,
    picture: url,
    [orgName]: (value) => value
      .trim()
      .min(2, 'The "A Team" had a longer name than that')
      .max(50, 'That isn\'t very memorable. Maybe shorten it up?')
  });
}

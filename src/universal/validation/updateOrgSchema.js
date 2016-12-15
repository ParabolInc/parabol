import {id, teamName, url} from 'universal/validation/templates';
import legitify from './legitify';

export default function updateOrgSchema(orgName = 'name') {
  return legitify({
    id,
    picture: url,
    [orgName]: teamName
  });
}

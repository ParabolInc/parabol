import {urlRegex} from 'universal/validation/regex';
import {avatar, id, preferredName} from 'universal/validation/templates';
import legitify from './legitify';

export default function makeUpdatedUserSchema() {
  return legitify({
    id,
    pictureFile: avatar,
    picture: (value) => value
      .trim()
      .matches(urlRegex, 'that picture url doesn\'t look quite right')
      .max(2000, 'please use a shorter url'),
    preferredName
  });
}

import {urlRegex} from 'universal/validation/regex';
import {avatar, requiredId} from 'universal/validation/templates';
import legitify from './legitify';

export default function makeUserServerSchema() {
  return legitify({
    id: requiredId,
    pictureFile: avatar,
    picture: (value) => value
      .trim()
      .matches(urlRegex, 'that picture url doesn\'t look quite right')
      .max(2000, 'please use a shorter url'),
    preferredName: (value) => value
      .trim()
      .min(2, 'C\'mon, you call that a name?')
      .max(100, 'I want your name, not your life story')
  });
}

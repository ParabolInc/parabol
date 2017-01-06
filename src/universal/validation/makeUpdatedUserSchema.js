import {urlRegex} from 'universal/validation/regex';
import {id, preferredName} from 'universal/validation/templates';
import legitify from './legitify';
import { APP_MAX_AVATAR_FILE_SIZE } from 'universal/utils/constants';

export default function makeUpdatedUserSchema() {
  return legitify({
    id,
    pictureFile: {
      size: (value) => value
        .int('Hey! Don\'t monkey with that!')
        .test((raw) => {
          if (raw > APP_MAX_AVATAR_FILE_SIZE) {
            return `File too large! It must be <${APP_MAX_AVATAR_FILE_SIZE / 1024}kB`;
          }
          return undefined;
        }),
      type: (value) => value
        .matches(/image\/.+/, 'File must be an image')
    },
    picture: (value) => value
      .trim()
      .matches(urlRegex, 'that picture url doesn\'t look quite right')
      .max(2000, 'please use a shorter url'),
    preferredName
  });
}

import {avatar} from 'universal/validation/templates';
import legitify from './legitify';

export default function makeAvatarSchema() {
  return legitify({
    pictureFile: avatar
  });
}

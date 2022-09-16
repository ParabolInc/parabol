import legitify from './legitify'
import {avatar} from './templates'

export default function makeAvatarSchema() {
  return legitify({
    pictureFile: avatar
  })
}

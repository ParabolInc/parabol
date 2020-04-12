import {avatar} from './templates'
import legitify from './legitify'

export default function makeAvatarSchema() {
  return legitify({
    pictureFile: avatar
  })
}

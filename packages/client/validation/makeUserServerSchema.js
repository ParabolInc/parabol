import {urlRegex} from './regex'
import legitify from './legitify'

export default function makeUserServerSchema() {
  return legitify({
    picture: (value) =>
      value
        .trim()
        .satisfies(
          (value) => {
            try {
              new URL(value)
            } catch(e) {
              return false
            }
            return true
          },
          'that picture url doesn’t look quite right'
        )
        .max(2000, 'please use a shorter url'),
    preferredName: (value) =>
      value
        .trim()
        .min(2, 'C’mon, you call that a name?')
        .max(100, 'I want your name, not your life story')
  })
}

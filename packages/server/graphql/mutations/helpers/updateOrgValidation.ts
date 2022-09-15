import legitify from 'parabol-client/validation/legitify'
import {optionalUrl, requiredId} from 'parabol-client/validation/templates'

export default function updateOrgValidation() {
  return legitify({
    id: requiredId,
    picture: optionalUrl,
    name: (value: any) =>
      value
        .trim()
        .min(2, 'The “A Team” had a longer name than that')
        .max(50, 'That isn’t very memorable. Maybe shorten it up?')
  })
}

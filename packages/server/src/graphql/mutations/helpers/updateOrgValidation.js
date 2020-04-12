import { requiredId, url } from 'parabol-client/src/validation/templates'
import legitify from 'parabol-client/src/validation/legitify'

export default function updateOrgValidation() {
  return legitify({
    id: requiredId,
    picture: url,
    name: (value) =>
      value
        .trim()
        .min(2, 'The “A Team” had a longer name than that')
        .max(50, 'That isn’t very memorable. Maybe shorten it up?')
  })
}

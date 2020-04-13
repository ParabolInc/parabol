import legitify from 'parabol-client/lib/validation/legitify'
import {orgName, teamName} from 'parabol-client/lib/validation/templates'

export default function addOrgValidation() {
  return legitify({
    newTeam: {
      name: teamName
    },
    orgName
  })
}

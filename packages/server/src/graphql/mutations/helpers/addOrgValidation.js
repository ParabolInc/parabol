import legitify from 'parabol-client/src/validation/legitify'
import { orgName, teamName } from 'parabol-client/src/validation/templates'

export default function addOrgValidation() {
  return legitify({
    newTeam: {
      name: teamName
    },
    orgName
  })
}

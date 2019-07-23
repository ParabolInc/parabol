import legitify from 'universal/validation/legitify'
import {orgName, teamName} from 'universal/validation/templates'

export default function addOrgValidation () {
  return legitify({
    newTeam: {
      name: teamName
    },
    orgName
  })
}

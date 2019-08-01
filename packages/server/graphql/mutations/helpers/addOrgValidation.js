import legitify from '../../../../client/validation/legitify'
import {orgName, teamName} from '../../../../client/validation/templates'

export default function addOrgValidation () {
  return legitify({
    newTeam: {
      name: teamName
    },
    orgName
  })
}

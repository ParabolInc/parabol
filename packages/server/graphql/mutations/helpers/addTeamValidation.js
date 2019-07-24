import legitify from '../../../../client/validation/legitify'
import {makeTeamNameSchema, requiredId} from '../../../../client/validation/templates'

export default function addTeamValidation (teamNames) {
  return legitify({
    newTeam: {
      name: makeTeamNameSchema(teamNames),
      orgId: requiredId
    }
  })
}

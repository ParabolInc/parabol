import legitify from 'universal/validation/legitify'
import {makeTeamNameSchema, requiredId} from 'universal/validation/templates'

export default function addTeamValidation(teamNames) {
  return legitify({
    newTeam: {
      name: makeTeamNameSchema(teamNames),
      orgId: requiredId
    }
  })
}

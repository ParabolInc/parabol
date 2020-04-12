import legitify from 'parabol-client/src/validation/legitify'
import { makeTeamNameSchema, requiredId } from 'parabol-client/src/validation/templates'

export default function addTeamValidation(teamNames) {
  return legitify({
    newTeam: {
      name: makeTeamNameSchema(teamNames),
      orgId: requiredId
    }
  })
}

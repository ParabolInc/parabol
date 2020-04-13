import legitify from 'parabol-client/lib/validation/legitify'
import {makeTeamNameSchema, requiredId} from 'parabol-client/lib/validation/templates'

export default function addTeamValidation(teamNames) {
  return legitify({
    newTeam: {
      name: makeTeamNameSchema(teamNames),
      orgId: requiredId
    }
  })
}

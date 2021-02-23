import legitify from 'parabol-client/validation/legitify'
import {makeTeamNameSchema, requiredId} from 'parabol-client/validation/templates'

export default function addTeamValidation(teamNames) {
  return legitify({
    newTeam: {
      name: makeTeamNameSchema(teamNames),
      orgId: requiredId
    }
  })
}

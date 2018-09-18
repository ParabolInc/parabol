import legitify from 'universal/validation/legitify'
import {
  fullName,
  makeTeamNameSchema,
  requiredEmail,
  requiredId
} from 'universal/validation/templates'

export default function addTeamValidation (teamNames) {
  return legitify({
    invitees: [
      {
        email: requiredEmail,
        fullName
      }
    ],
    newTeam: {
      name: makeTeamNameSchema(teamNames),
      orgId: requiredId
    }
  })
}

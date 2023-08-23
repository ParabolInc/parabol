import {QueryResolvers} from '../resolverTypes'
import {getExistingOneOnOneTeam} from '../../mutations/helpers/getExistingOneOnOneTeam'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {GQLContext} from '../../graphql'
import {getUserId} from '../../../utils/authorization'
import {CreateOneOnOneTeamInput} from '../../private/resolverTypes'

const isOneOnOneTeamExists: QueryResolvers['isOneOnOneTeamExists'] = async (
  _: any,
  {oneOnOneTeamInput}: {oneOnOneTeamInput: CreateOneOnOneTeamInput},
  context: GQLContext
) => {
  const {authToken, dataLoader} = context

  const {email, orgId} = oneOnOneTeamInput

  const viewerId = getUserId(authToken)

  const existingUser = await getUserByEmail(email)

  if (!existingUser) {
    return {
      team: null
    }
  }

  const existingTeam = await getExistingOneOnOneTeam(existingUser.id, viewerId, orgId)
  if (existingTeam) {
    return {
      team: await dataLoader.get('teams').loadNonNull(existingTeam.id)
    }
  }

  return {
    team: null
  }
}

export default isOneOnOneTeamExists

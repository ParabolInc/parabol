import {GraphQLID, GraphQLNonNull, GraphQLResolveInfo} from 'graphql'
import {getUserId, isSuperUser, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import Team from '../types/Team'

// HANDLED_OPS is a list of operations that we gracefully handle on the client, so we don't want to report them to sentry
const HANDLED_OPS = ['TeamRootQuery', 'TeamContainerQuery']

export default {
  type: Team,
  description: 'A query for a team',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team ID for the desired team'
    }
  },
  async resolve(
    _source: unknown,
    {teamId}: {teamId: string},
    {authToken, dataLoader}: GQLContext,
    {operation}: GraphQLResolveInfo
  ) {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const {orgId} = team
    const viewerId = getUserId(authToken)
    const {role} =
      (await dataLoader.get('organizationUsersByUserIdOrgId').load({userId: viewerId, orgId})) ?? {}
    const isOrgAdmin = role === 'ORG_ADMIN'
    if (!isOrgAdmin && !isTeamMember(authToken, teamId) && !isSuperUser(authToken)) {
      const viewerId = getUserId(authToken)
      if (!HANDLED_OPS.includes(operation?.name?.value ?? '')) {
        standardError(new Error('Team not found'), {userId: viewerId})
      }
      return null
    }
    return dataLoader.get('teams').load(teamId)
  }
}

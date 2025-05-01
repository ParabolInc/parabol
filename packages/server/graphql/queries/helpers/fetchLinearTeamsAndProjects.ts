import {GraphQLResolveInfo} from 'graphql'
import {isNotNull} from 'parabol-client/utils/predicates'
import LinearServerManager from '../../../integrations/linear/LinearServerManager'
import {Logger} from '../../../utils/Logger'
import {GQLContext} from '../../graphql'

export const fetchLinearProjects = async (
  teamId: string,
  userId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  try {
    const {dataLoader} = context
    const auth = await dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'linear', teamId, userId})

    if (!auth?.accessToken) {
      return []
    }

    const manager = new LinearServerManager(auth, context, info)

    const [data, error] = await manager.getProjects({})

    if (error) {
      Logger.error(
        `Error fetching Linear projects for user ${userId} in team ${teamId}: ${error.message}`
      )
      return []
    }

    return (
      data.projects?.edges
        ?.map(
          (edge: any) =>
            edge?.node && {
              ...edge.node,
              service: 'linear' as const,
              teamId: edge.node.teams.nodes.id
            }
        )
        .filter(isNotNull) ?? []
    )
  } catch (error: any) {
    Logger.error(
      `Unexpected error in fetchLinearProjects for user ${userId} in team ${teamId}: ${error.message}`
    )
    return []
  }
}

export const fetchLinearTeams = async (
  teamId: string,
  userId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  try {
    const {dataLoader} = context
    const auth = await dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'linear', teamId, userId})

    if (!auth?.accessToken) {
      return []
    }

    const manager = new LinearServerManager(auth, context, info)

    const [data, error] = await manager.getTeamsAndProjects({})

    if (error) {
      Logger.error(
        `Error fetching Linear teams for user ${userId} in team ${teamId}: ${error.message}`
      )
      return []
    }

    return (
      data.teams?.edges
        ?.map(
          (edge: any) =>
            edge?.node && {
              ...edge.node,
              service: 'linear' as const,
              teamId: edge.node.id
            }
        )
        .filter(isNotNull) ?? []
    )
  } catch (error: any) {
    Logger.error(
      `Unexpected error in fetchLinearTeamsAndProjects for user ${userId} in team ${teamId}: ${error.message}`
    )
    return []
  }
}

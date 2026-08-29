import type {GraphQLResolveInfo} from 'graphql'
import {isNotNull} from 'parabol-client/utils/predicates'
import LinearServerManager from '../../../integrations/linear/LinearServerManager'
import type {GQLContext} from '../../graphql'

export const fetchLinearProjects = async (
  teamId: string,
  userId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  try {
    const {dataLoader} = context
    const auth = await dataLoader.get('freshAuth').load({service: 'linear', teamId, userId})

    if (!auth?.accessToken) {
      return []
    }

    const manager = new LinearServerManager(auth, context, info)

    const [data, error] = await manager.getProjects({})

    if (error) return error

    return (
      data.projects?.edges
        ?.map(
          (edge: any) =>
            edge?.node && {
              ...edge.node,
              service: 'linear' as const,
              teamId: edge.node.teams?.nodes?.[0]?.id
            }
        )
        .filter(isNotNull)
        .filter((project: {teamId?: string}) => !!project.teamId) ?? []
    )
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error))
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
    const auth = await dataLoader.get('freshAuth').load({service: 'linear', teamId, userId})

    if (!auth?.accessToken) {
      return []
    }

    const manager = new LinearServerManager(auth, context, info)

    const [data, error] = await manager.getTeamsAndProjects({})

    if (error) return error

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
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error))
  }
}

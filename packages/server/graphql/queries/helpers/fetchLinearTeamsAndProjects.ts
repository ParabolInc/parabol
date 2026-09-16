import type {GraphQLResolveInfo} from 'graphql'
import LinearServerManager from '../../../integrations/linear/LinearServerManager'
import type {LinearProject} from '../../../integrations/platform/RemoteRepoIntegration'
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

    return data.projects.edges
      .map(({node}) => ({...node, service: 'linear' as const}))
      .filter((project): project is LinearProject => project.teams.nodes.length > 0)
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

    return data.teams.edges.map(({node}) => ({...node, service: 'linear' as const}))
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error))
  }
}

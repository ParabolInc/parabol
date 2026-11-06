import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../graphql/graphql'
import type {GetProjectsQuery, GetTeamsAndProjectsQuery} from '../../types/linearTypes'
import LinearServerManager from './LinearServerManager'

export type LinearTeam = GetTeamsAndProjectsQuery['teams']['edges'][number]['node'] & {
  service: 'linear'
}

type LinearProjectNode = GetProjectsQuery['projects']['edges'][number]['node']
type LinearProjectTeam = LinearProjectNode['teams']['nodes'][number]

/** Only projects with a team are cached; the id and the label both need it */
export type LinearProject = LinearProjectNode & {
  service: 'linear'
  teams: {nodes: [LinearProjectTeam, ...LinearProjectTeam[]]}
}

export type LinearRepo = LinearTeam | LinearProject

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

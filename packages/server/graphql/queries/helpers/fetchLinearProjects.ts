import {GraphQLResolveInfo} from 'graphql'
import {isNotNull} from 'parabol-client/utils/predicates'
import LinearServerManager from '../../../integrations/linear/LinearServerManager'
import {GetProjectsQuery} from '../../../types/linearTypes'
import {Logger} from '../../../utils/Logger'
import {GQLContext} from '../../graphql'

type LinearProjectNode = NonNullable<
  NonNullable<NonNullable<GetProjectsQuery['projects']>['edges']>[0]
>['node']

type LinearProjectIntegration = NonNullable<LinearProjectNode> & {
  service: 'linear'
}

const fetchLinearProjects = async (
  teamId: string,
  userId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
): Promise<LinearProjectIntegration[]> => {
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

    const linearProjects: LinearProjectIntegration[] =
      data?.projects?.edges
        ?.map((edge: any) => {
          if (!edge?.node) {
            return null
          }

          return {...edge.node, service: 'linear' as const}
        })
        .filter(isNotNull) ?? []

    return linearProjects
  } catch (error: any) {
    Logger.error(
      `Unexpected error in fetchLinearProjects for user ${userId} in team ${teamId}: ${error.message}`
    )
    return []
  }
}

export default fetchLinearProjects

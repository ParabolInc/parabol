import {buildAzureDevOpsSearchWiql} from '../../../integrations/azureDevOps/buildAzureDevOpsWiql'
import searchAzureDevOpsWorkItems from '../../../integrations/azureDevOps/searchAzureDevOpsWorkItems'
import connectionFromTasks from '../../queries/helpers/connectionFromTasks'
import type {AzureDevOpsIntegrationResolvers} from '../resolverTypes'

export type AzureDevOpsIntegrationSource = {
  teamId: string
  userId: string
}

const MAX_WORK_ITEMS = 100

const AzureDevOpsIntegration: AzureDevOpsIntegrationResolvers = {
  auth: async ({teamId, userId}, _args, {dataLoader}) => {
    return dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'azureDevOps', teamId, userId})
  },

  id: ({teamId, userId}) => `ado:${teamId}:${userId}`,

  workItems: async (
    {teamId, userId},
    {first, queryString, projectKeyFilters, isWIQL},
    {dataLoader}
  ) => {
    const limit = Math.min(Math.max(first ?? MAX_WORK_ITEMS, 1), MAX_WORK_ITEMS)
    const wiql = buildAzureDevOpsSearchWiql(queryString ?? null, isWIQL)
    if (wiql instanceof Error) return connectionFromTasks([], 0, wiql)
    const workItems = await searchAzureDevOpsWorkItems(
      {dataLoader, teamId, userId},
      {...wiql, projects: projectKeyFilters, limit}
    )
    if (workItems instanceof Error) return connectionFromTasks([], 0, workItems)
    return connectionFromTasks(workItems, limit)
  },

  cloudProvider: async (_source, _args, {dataLoader}) => {
    const [globalProvider] = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'azureDevOps', orgIds: [], teamIds: []})
    return globalProvider ?? null
  },

  sharedProviders: async ({teamId}, _args, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const {orgId} = team
    return dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'azureDevOps', orgIds: [orgId], teamIds: [teamId]})
  }
}

export default AzureDevOpsIntegration

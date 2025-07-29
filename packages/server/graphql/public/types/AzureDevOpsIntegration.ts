import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import connectionFromTasks from '../../queries/helpers/connectionFromTasks'
import type {AzureDevOpsIntegrationResolvers} from '../resolverTypes'

export type AzureDevOpsIntegrationSource = {
  teamId: string
  userId: string
}

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
    {authToken, dataLoader}
  ) => {
    const viewerId = getUserId(authToken)
    if (!isTeamMember(authToken, teamId)) {
      const err = new Error("Cannot access another team member's user stories")
      standardError(err, {tags: {teamId, userId}, userId: viewerId})
      return connectionFromTasks([], 0, err)
    }
    try {
      const allUserWorkItems = await dataLoader.get('azureDevOpsAllWorkItems').load({
        teamId,
        userId,
        queryString: queryString ?? null,
        projectKeyFilters,
        isWIQL,
        limit: first
      })
      if (allUserWorkItems instanceof Error) {
        return connectionFromTasks([], 0, allUserWorkItems)
      } else {
        const workItems = Array.from(
          allUserWorkItems.map((userWorkItem) => {
            return {
              ...userWorkItem,
              updatedAt: new Date()
            }
          })
        )
        return connectionFromTasks(workItems, first, undefined)
      }
    } catch (error) {
      return connectionFromTasks(
        [],
        0,
        error instanceof Error ? error : new Error('Failed to fetch work items')
      )
    }
  },

  projects: ({teamId, userId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    if (viewerId !== userId) return []
    return dataLoader.get('allAzureDevOpsProjects').load({teamId, userId})
  },

  cloudProvider: async (_source, _args, {dataLoader}) => {
    const [globalProvider] = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'azureDevOps', orgIds: [], teamIds: []})
    return globalProvider!
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

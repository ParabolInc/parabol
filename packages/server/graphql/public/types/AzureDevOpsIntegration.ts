import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import connectionFromTasks from '../../queries/helpers/connectionFromTasks'
import {AzureDevOpsIntegrationResolvers} from '../resolverTypes'

export type AzureDevOpsIntegrationSource = {
  teamId: string
  userId: string
}
type WorkItemArgs = {
  first: number
  after?: string
  queryString: string | null
  projectKeyFilters: string[] | null
  isWIQL: boolean
}

const AzureDevOpsIntegration: AzureDevOpsIntegrationResolvers = {
  auth: async ({teamId, userId}, _args, {dataLoader}) => {
    return dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'azureDevOps', teamId, userId})
  },

  id: ({teamId, userId}) => `ado:${teamId}:${userId}`,

  workItems: async ({teamId, userId}, args, {authToken, dataLoader}) => {
    const {first, queryString, projectKeyFilters, isWIQL} = args as WorkItemArgs
    const viewerId = getUserId(authToken)
    if (!isTeamMember(authToken, teamId)) {
      const err = new Error("Cannot access another team member's user stories")
      standardError(err, {tags: {teamId, userId}, userId: viewerId})
      return connectionFromTasks([], 0, err)
    }
    const allUserWorkItems = await dataLoader
      .get('azureDevOpsAllWorkItems')
      .load({teamId, userId, queryString, projectKeyFilters, isWIQL})
    if (!allUserWorkItems) {
      return connectionFromTasks([], 0, undefined)
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

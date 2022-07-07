import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import {IntegrationProviderAzureDevOps} from '../../postgres/queries/getIntegrationProvidersByIds'
import {getUserId, isTeamMember} from '../../utils/authorization'
import AzureDevOpsServerManager from '../../utils/AzureDevOpsServerManager'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import connectionFromTasks from '../queries/helpers/connectionFromTasks'
import AzureDevOpsRemoteProject from './AzureDevOpsRemoteProject'
import AzureDevOpsSearchQuery from './AzureDevOpsSearchQuery'
import {AzureDevOpsWorkItemConnection} from './AzureDevOpsWorkItem'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import IntegrationProviderOAuth2 from './IntegrationProviderOAuth2'
import TeamMemberIntegrationAuthOAuth2 from './TeamMemberIntegrationAuthOAuth2'

type WorkItemArgs = {
  first: number
  after?: string
  queryString: string | null
  projectKeyFilters: string[] | null
  isWIQL: boolean
}

const AzureDevOpsIntegration = new GraphQLObjectType<any, GQLContext>({
  name: 'AzureDevOpsIntegration',
  description: 'The Azure DevOps auth + integration helpers for a specific team member',
  fields: () => ({
    auth: {
      description: 'The OAuth2 Authorization for this team member',
      type: TeamMemberIntegrationAuthOAuth2,
      resolve: async (
        {teamId, userId}: {teamId: string; userId: string},
        _args: unknown,
        {dataLoader}
      ) => {
        return dataLoader
          .get('teamMemberIntegrationAuths')
          .load({service: 'azureDevOps', teamId, userId})
      }
    },
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Composite key in ado:teamId:userId format',
      resolve: ({teamId, userId}: {teamId: string; userId: string}) => `ado:${teamId}:${userId}`
    },
    accountId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The Azure DevOps account ID'
    },
    instanceIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'The Azure DevOps instance IDs that the user has granted'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the provider was created'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team that the token is linked to'
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the token was updated at'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The user that the access token is attached to'
    },
    workItems: {
      type: new GraphQLNonNull(AzureDevOpsWorkItemConnection),
      description:
        'A list of work items coming straight from the azure dev ops integration for a specific team member',
      args: {
        first: {
          type: GraphQLInt,
          defaultValue: 100
        },
        after: {
          type: GraphQLISO8601Type,
          description: 'the datetime cursor'
        },
        queryString: {
          type: GraphQLString,
          description: 'A string of text to search for, or WIQL if isWIQL is true'
        },
        projectKeyFilters: {
          type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
          description: 'A list of projects to restrict the search to, if null will search all'
        },
        isWIQL: {
          type: new GraphQLNonNull(GraphQLBoolean),
          description: 'true if the queryString is WIQL, else false'
        }
      },
      resolve: async ({teamId, userId}, args: any, {authToken, dataLoader}: GQLContext) => {
        const {first, queryString, projectKeyFilters, isWIQL} = args as WorkItemArgs
        const viewerId = getUserId(authToken)
        if (!isTeamMember(authToken, teamId)) {
          const err = new Error('Cannot access another team members user stories')
          standardError(err, {tags: {teamId, userId}, userId: viewerId})
          return connectionFromTasks([], 0, err)
        }
        const auth = (await dataLoader
          .get('freshAzureDevOpsAuth')
          .load({teamId, userId})) as IGetTeamMemberIntegrationAuthQueryResult | null
        if (auth === null) {
          const err = new Error(
            'You cannot get user stories from Azure DevOps without have an auth token'
          )
          standardError(err, {tags: {teamId, userId}, userId: viewerId})
          return connectionFromTasks([], 0, err)
        }
        const {accessToken} = auth
        if (accessToken === null) {
          const err = new Error(
            'You cannot get user stories from Azure DevOps without have an accessToken'
          )
          standardError(err, {tags: {teamId, userId}, userId: viewerId})
          return connectionFromTasks([], 0, err)
        }
        const provider = await dataLoader.get('integrationProviders').loadNonNull(auth.providerId)

        if (!provider) {
          return null
        }

        const manager = new AzureDevOpsServerManager(
          auth,
          provider as IntegrationProviderAzureDevOps
        )

        if (!manager) {
          return null
        }
        const restResult = await manager.getAllUserWorkItems(queryString, projectKeyFilters, isWIQL)
        const {error, workItems: innerWorkItems} = restResult
        if (error !== undefined) {
          console.log(error)
          standardError(error, {tags: {teamId, userId}, userId: viewerId})
          return connectionFromTasks([], 0, error)
        }
        if (innerWorkItems === undefined) {
          return connectionFromTasks([], 0, undefined)
        } else {
          const workItems = Array.from(
            innerWorkItems.map((workItem) => {
              return {
                id: workItem.id.toString(),
                title: workItem.fields['System.Title'],
                teamProject: workItem.fields['System.Title'],
                url: workItem.url,
                state: workItem.fields['System.State'],
                type: workItem.fields['System.WorkItemType'],
                descriptionHTML: workItem.fields['System.Description']
                  ? workItem.fields['System.Description']
                  : '',
                service: 'azureDevOps',
                updatedAt: new Date()
              }
            })
          )
          return connectionFromTasks(workItems, first, undefined)
        }
      }
    },
    projects: {
      // Create a new object for ADO Projects (new schema object)
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AzureDevOpsRemoteProject))),
      description:
        'A list of projects coming straight from the azure dev ops integration for a specific team member',
      resolve: ({teamId, userId}, _args: unknown, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        if (viewerId !== userId) return []
        return dataLoader.get('allAzureDevOpsProjects').load({teamId, userId})
      }
    },
    cloudProvider: {
      description:
        'The cloud provider the team member may choose to integrate with. Nullable based on env vars',
      type: IntegrationProviderOAuth2,
      resolve: async (_source: unknown, _args: unknown, {dataLoader}) => {
        const [globalProvider] = await dataLoader
          .get('sharedIntegrationProviders')
          .load({service: 'azureDevOps', orgTeamIds: ['aGhostTeam'], teamIds: []})
        return globalProvider
      }
    },
    sharedProviders: {
      description: 'The non-global providers shared with the team or organization',
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(IntegrationProviderOAuth2))),
      resolve: async ({teamId}: {teamId: string}, _args: unknown, {dataLoader}) => {
        const team = await dataLoader.get('teams').loadNonNull(teamId)
        const {orgId} = team
        const orgTeams = await dataLoader.get('teamsByOrgIds').load(orgId)
        const orgTeamIds = orgTeams.map(({id}) => id)
        return dataLoader
          .get('sharedIntegrationProviders')
          .load({service: 'azureDevOps', orgTeamIds, teamIds: [teamId]})
      }
    },
    azureDevOpsSearchQueries: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AzureDevOpsSearchQuery))),
      description:
        'the list of suggested search queries, sorted by most recent. Guaranteed to be < 60 days old'
      //resolve: async ({teamId, userId, jiraSearchQueries}) => {}
    }
  })
})

export default AzureDevOpsIntegration

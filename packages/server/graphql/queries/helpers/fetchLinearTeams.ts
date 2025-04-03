import {GraphQLResolveInfo} from 'graphql'
import LinearServerManager from '../../../integrations/linear/LinearServerManager'
import {Logger} from '../../../utils/Logger' // Import Logger
import {GQLContext} from '../../graphql'

type LinearTeamFromApi = {
  id: string
  name: string
  key: string
}

export type LinearTeamIntegration = {
  id: string // Linear Team ID
  name: string // Linear Team Name
  key: string // Linear Team Key
  service: 'linear'
  __typename?: 'LinearTeam' // Match the intended GraphQL type name
}

const fetchLinearTeams = async (
  teamId: string,
  userId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
): Promise<LinearTeamIntegration[]> => {
  try {
    const {dataLoader} = context
    const auth = await dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'linear', teamId, userId})

    console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
    console.log('fetchLinearTeams()')
    console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')

    if (!auth?.accessToken) {
      return []
    }

    // TODO: Instantiate LinearServerManager correctly.
    // This might involve passing the correct serverBaseUrl if applicable,
    // similar to GitLabServerManager, or just auth, context, info.
    // Assuming constructor similar to LinearServerManager provided earlier
    const linearManager = new LinearServerManager(auth, context, info)

    // TODO: Implement a getTeams method in LinearServerManager
    // This method should fetch teams from the Linear API
    // TODO: Implement a getTeams method in LinearServerManager
    // This method should fetch teams from the Linear API
    // const [teamsData, error] = await linearManager.getTeams({}); // Assuming a similar pattern to getProjects
    // Using placeholder types for now:
    const teamsData: any = null // Simplified placeholder structure
    // Initialize error placeholder inside try, before potential assignment
    let error: Error | null = null // Declare and initialize error placeholder

    if (error) {
      // Use type assertion to access message property safely
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as Error).message
          : `Unknown error: ${error}`
      Logger.error(
        `Error fetching Linear teams for user ${userId} in team ${teamId}: ${errorMessage}`
      )
      return []
    }

    // TODO: Adjust mapping based on the actual structure returned by linearManager.getTeams()
    // Assuming teamsData might look like { teams: { nodes: [...] } } or similar
    const teamsFromApi: LinearTeamFromApi[] = teamsData?.teams?.nodes ?? [] // Placeholder mapping

    // Map API response to the LinearTeamIntegration structure
    const linearTeams: LinearTeamIntegration[] = teamsFromApi.map((team) => ({
      id: team.id,
      name: team.name,
      key: team.key,
      service: 'linear',
      __typename: 'LinearTeam' // Ensure this matches the GraphQL type name
    }))

    return linearTeams
  } catch (error: any) {
    Logger.error(
      `Unexpected error in fetchLinearTeams for user ${userId} in team ${teamId}: ${error.message}`
    )
    // Return empty array on unexpected errors
    return []
  }
}

export default fetchLinearTeams

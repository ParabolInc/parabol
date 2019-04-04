import {GraphQLObjectType} from 'graphql'
import {resolveTeam} from 'server/graphql/resolvers'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import Team from 'server/graphql/types/Team'
import AtlassianProject from './AtlassianProject'

const AddAtlassianProjectPayload = new GraphQLObjectType({
  name: 'AddAtlassianProjectPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    atlassianProject: {
      type: AtlassianProject,
      description: 'new project added',
      resolve: ({atlassianProjectId}, _args, {dataLoader}) => {
        return dataLoader.get('atlassianProjects').load(atlassianProjectId)
      }
    },
    team: {
      type: Team,
      description: 'The team with the new project',
      resolve: resolveTeam
    }
  })
})

export default AddAtlassianProjectPayload

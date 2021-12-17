import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import AtlassianIntegration from './AtlassianIntegration'
import makeMutationPayload from './makeMutationPayload'

export const PersistJiraSearchQuerySuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'PersistJiraSearchQuerySuccess',
  fields: () => ({
    atlassianIntegration: {
      type: AtlassianIntegration,
      description: 'The newly created auth',
      resolve: async ({teamId, userId}, _args: unknown, {dataLoader}) => {
        return await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
      }
    }
  })
})

const PersistJiraSearchQueryPayload = makeMutationPayload(
  'PersistJiraSearchQueryPayload',
  PersistJiraSearchQuerySuccess
)

export default PersistJiraSearchQueryPayload

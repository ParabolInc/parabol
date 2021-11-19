import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import Organization from './Organization'
import {GQLContext} from '../graphql'

const SuProOrgInfo = new GraphQLObjectType<any, GQLContext>({
  name: 'SuProOrgInfo',
  description: '',
  fields: () => ({
    organization: {
      type: Organization,
      description: 'The PRO organization',
      resolve: ({organizationId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('organizations').load(organizationId)
      }
    },
    organizationId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the Organization'
    }
  })
})

export default SuProOrgInfo

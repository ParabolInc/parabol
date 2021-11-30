import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import Organization from './Organization'
import {GQLContext} from '../graphql'

const FlagConversionModalPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'FlagConversionModalPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    org: {
      type: Organization,
      description: 'the org with the limit added or removed',
      resolve: ({orgId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('organizations').load(orgId)
      }
    }
  })
})

export default FlagConversionModalPayload

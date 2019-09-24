import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import Organization from './Organization'

const FlagConversionModalPayload = new GraphQLObjectType({
  name: 'FlagConversionModalPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    org: {
      type: Organization,
      description: 'the org with the limit added or removed',
      resolve: ({orgId}, _args, {dataLoader}) => {
        return dataLoader.get('organizations').load(orgId)
      }
    }
  })
})

export default FlagConversionModalPayload

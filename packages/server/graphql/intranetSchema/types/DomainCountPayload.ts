import {GraphQLInt, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../../graphql'
import {GraphQLID} from 'graphql'

const DomainCountPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'DomainCountPayload',
  fields: () => ({
    domain: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the email domain'
    },
    total: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'the sum total'
    }
  })
})

export default DomainCountPayload

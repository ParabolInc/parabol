import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'

const Organization: GraphQLObjectType<any, GQLContext> = new GraphQLObjectType<any, GQLContext>({
  name: 'Organization',
  fields: {}
})

export default Organization

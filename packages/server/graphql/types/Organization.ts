import {GraphQLObjectType} from 'graphql'
import type {GQLContext} from '../graphql'

const Organization: GraphQLObjectType<any, GQLContext> = new GraphQLObjectType<any, GQLContext>({
  name: 'Organization',
  fields: {}
})

export default Organization

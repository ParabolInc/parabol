import {GraphQLObjectType} from 'graphql'
import type {GQLContext} from './graphql'

export default new GraphQLObjectType<any, GQLContext>({
  name: 'Mutation',
  fields: () => ({}) as any
})

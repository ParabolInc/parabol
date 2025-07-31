import {GraphQLObjectType} from 'graphql'
import type {GQLContext} from '../graphql'

const RetroReflectionGroup: GraphQLObjectType = new GraphQLObjectType<any, GQLContext>({
  name: 'RetroReflectionGroup',
  fields: {}
})

export default RetroReflectionGroup

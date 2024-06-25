import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'

const RetroReflectionGroup: GraphQLObjectType = new GraphQLObjectType<any, GQLContext>({
  name: 'RetroReflectionGroup',
  fields: {}
})

export default RetroReflectionGroup

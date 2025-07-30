import {GraphQLObjectType} from 'graphql'
import type {GQLContext} from '../graphql'

const TeamMember = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamMember',
  fields: {}
})

export default TeamMember

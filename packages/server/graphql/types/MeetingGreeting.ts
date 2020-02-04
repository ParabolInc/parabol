import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const MeetingGreeting = new GraphQLObjectType<any, GQLContext>({
  name: 'MeetingGreeting',
  fields: () => ({
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The foreign-language greeting'
    },
    language: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The source language for the greeting'
    }
  })
})

export default MeetingGreeting

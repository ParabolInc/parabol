import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';

const MeetingGreeting = new GraphQLObjectType({
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
});

export default MeetingGreeting;

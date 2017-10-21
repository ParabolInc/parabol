import {GraphQLObjectType, GraphQLString} from 'graphql';

const MeetingGreeting = new GraphQLObjectType({
  name: 'MeetingGreeting',
  fields: () => ({
    content: {type: GraphQLString, description: 'The foreign-language greeting'},
    language: {type: GraphQLString, description: 'The source language for the greeting'}
  })
});

export default MeetingGreeting;

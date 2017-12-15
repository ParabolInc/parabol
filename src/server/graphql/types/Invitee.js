import {GraphQLInputObjectType, GraphQLNonNull, GraphQLString} from 'graphql';
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType';

const Invitee = new GraphQLInputObjectType({
  name: 'Invitee',
  description: 'The email and task of an invited team member',
  fields: () => ({
    email: {
      type: new GraphQLNonNull(GraphQLEmailType),
      description: 'The email address of the invitee'
    },
    fullName: {
      type: GraphQLString,
      description: 'The name derived from an RFC5322 email string'
    },
    task: {
      type: GraphQLString,
      description: 'The current task the invitee is working on'
    }
  })
});

export default Invitee;

import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList
} from 'graphql';
import {errorObj} from '../utils';

// import {Team} from '../Team/teamSchema';
// import {getTeamById} from '../Team/helpers';

export const Meeting = new GraphQLObjectType({
  name: 'Meeting',
  description: 'A meeting',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique meeting ID'},
    createdAt: {type: GraphQLString, description: 'The datetime the meeting was created'},
    updatedAt: {type: GraphQLString, description: 'The datetime the meeting was last updated'},
    lastUpdatedBy: {type: GraphQLString, description: 'The last user to update the content'},
    // team: {
    //   type: Team,
    //   async resolve(source) {
    //     console.log(source);
    //     const team = await getTeamById(source.teamId);
    //     if (!team) {
    //       throw errorObj({_error: 'Team not found'});
    //     }
    //     return team;
    //   }
    // },
    // teamId: {type: new GraphQLNonNull(GraphQLID), description: 'The team this meeting belongs to'},
    // content: {type: GraphQLString, description: 'The content of the meeting'},
    // currentEditors: {
    //   type: new GraphQLList(GraphQLString),
    //   description: 'a list of socketIds currently editing the content'
    // }
  })
});

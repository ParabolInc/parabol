import r from '../../../database/rethinkDriver';
import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList
} from 'graphql';
import {Participant} from '../Participant/participantSchema';
import {getRequestedFields} from '../utils';
import makeChangefeedHandler from '../makeChangefeedHandler';

export const SOUNDOFF = 'SOUNDOFF';
export const PRESENT = 'PRESENT';

export const Meeting = new GraphQLObjectType({
  name: 'Meeting',
  description: 'A meeting',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique meeting ID'},
    createdAt: {type: GraphQLString, description: 'The datetime the meeting was created'},
    updatedAt: {type: GraphQLString, description: 'The datetime the meeting was last updated'},
    lastUpdatedBy: {type: GraphQLString, description: 'The last user to update the content'},
    participants: {
      type: new GraphQLList(Participant),
      description: 'The participants involved in the meeting',
      async resolve(source, args, {socket, subbedChannelName}, refs) {
        const {operation: {operation}, fieldName} = refs;
        if (operation === 'subscription') {
          const requestedFields = getRequestedFields(refs);
          const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName, {patch: refs.fieldName});
          r.table('Participant')
            .getAll(source.id, {index: 'meetingId'})
            .pluck(requestedFields)
            .changes({includeInitial: true})
            .run({cursor: true}, changefeedHandler);
        } else {
          if (source && (typeof source === 'object' || typeof source === 'function')) {
            const property = source[fieldName];
            return typeof property === 'function' ? property() : property;
          }
        }
        return [{id: 'part'}];
        // await r.table('Participant')
      }
    }
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

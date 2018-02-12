import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import RetroThought from 'server/graphql/types/RetroThought';

const RetroThoughtGroup = new GraphQLObjectType({
  name: 'RetroThoughtGroup',
  description: 'A thought created during the think phase of a retrospective',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the meeting was created'
    },
    title: {
      type: GraphQLString,
      description: 'The title of the grouping of the retrospective thoughts'
    },
    retroThoughts: {
      type: new GraphQLList(RetroThought),
      description: 'The thoughts that belong in the group',
      resolve: ({id: retroGroupId}, args, {dataLoader}) => {
        return dataLoader.get('retroThoughtsByGroupId').load(retroGroupId);
      }
    }
  })
});

export default RetroThoughtGroup;

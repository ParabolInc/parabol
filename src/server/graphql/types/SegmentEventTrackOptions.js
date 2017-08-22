import {GraphQLID, GraphQLInputObjectType} from 'graphql';

const SegmentEventTrackOptions = new GraphQLInputObjectType({
  name: 'SegmentEventTrackOptions',
  fields: () => ({
    teamId: {type: GraphQLID},
    orgId: {type: GraphQLID},
  })
});

export default SegmentEventTrackOptions;
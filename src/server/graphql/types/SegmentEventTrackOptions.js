import {GraphQLID, GraphQLInputObjectType, GraphQLInt} from 'graphql';

const SegmentEventTrackOptions = new GraphQLInputObjectType({
  name: 'SegmentEventTrackOptions',
  fields: () => ({
    teamId: {type: GraphQLID},
    orgId: {type: GraphQLID},
    inviteeCount: {
      type: GraphQLInt,
      description: 'Used during the welcome wizard step 3'
    }
  })
});

export default SegmentEventTrackOptions;

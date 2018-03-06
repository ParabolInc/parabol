import {GraphQLObjectType} from 'graphql';
import NewMeetingStage, {newMeetingStageFields} from 'server/graphql/types/NewMeetingStage';

const GenericMeetingStage = new GraphQLObjectType({
  name: 'GenericMeetingStage',
  description: 'A stage of a meeting that has no extra state. Only used for single-stage phases',
  interfaces: () => [NewMeetingStage],
  fields: newMeetingStageFields
});

export default GenericMeetingStage;

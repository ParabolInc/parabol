import {GraphQLID, GraphQLObjectType} from 'graphql';
import NewMeetingStage, {newMeetingStageFields} from 'server/graphql/types/NewMeetingStage';
import RetroThoughtGroup from 'server/graphql/types/RetroThoughtGroup';

const RetroDiscussStage = new GraphQLObjectType({
  name: 'RetroDiscussStage',
  description: 'The stage where the team discusses a single theme',
  interfaces: () => [NewMeetingStage],
  fields: () => ({
    ...newMeetingStageFields(),
    thoughtGroupId: {
      type: GraphQLID,
      description: 'foreign key. use thoughtGroup'
    },
    thoughtGroup: {
      type: RetroThoughtGroup,
      description: 'the group that is the focal point of the discussion',
      resolve: ({thoughtGroupId}, args, {dataLoader}) => {
        return dataLoader.get('retroThoughtGroups').load(thoughtGroupId);
      }
    }
  })
});

export default RetroDiscussStage;

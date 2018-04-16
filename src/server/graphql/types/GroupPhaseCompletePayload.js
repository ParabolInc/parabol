import {GraphQLList, GraphQLObjectType} from 'graphql';
import RetroReflectionGroup from 'server/graphql/types/RetroReflectionGroup';

const GroupPhaseCompletePayload = new GraphQLObjectType({
  name: 'GroupPhaseCompletePayload',
  fields: () => ({
    reflectionGroups: {
      type: new GraphQLList(RetroReflectionGroup),
      description: 'a list of updated reflection groups',
      resolve: ({reflectionGroupIds}, args, {dataLoader}) => {
        return dataLoader.get('retroReflectionGroups').loadMany(reflectionGroupIds);
      }
    }
  })
});

export default GroupPhaseCompletePayload;

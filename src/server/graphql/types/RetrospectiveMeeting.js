import {GraphQLFloat, GraphQLList, GraphQLObjectType} from 'graphql';
import NewMeeting, {newMeetingFields} from 'server/graphql/types/NewMeeting';
import RetroReflectionGroup from 'server/graphql/types/RetroReflectionGroup';
import RetroReflection from 'server/graphql/types/RetroReflection';
import {resolveForSU} from 'server/graphql/resolvers';

const RetrospectiveMeeting = new GraphQLObjectType({
  name: 'RetrospectiveMeeting',
  interfaces: () => [NewMeeting],
  description: 'A retrospective meeting',
  fields: () => ({
    ...newMeetingFields(),
    autoGroupThreshold: {
      type: GraphQLFloat,
      description: 'the threshold used to achieve the autogroup. Useful for model tuning. Serves as a flag if autogroup was used.',
      resolve: resolveForSU('autoGroupThreshold')
    },
    reflectionGroups: {
      type: new GraphQLList(RetroReflectionGroup)
    },
    reflections: {
      type: new GraphQLList(RetroReflection),
      description: 'The reflections generated during the reflect phase of the retro',
      resolve: ({id}, args, {dataLoader}) => {
        return dataLoader.get('retroReflectionsByMeetingId').load(id);
      }
    }
  })
});

export default RetrospectiveMeeting;

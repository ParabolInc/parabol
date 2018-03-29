import {GraphQLNonNull, GraphQLFloat, GraphQLList, GraphQLObjectType} from 'graphql';
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
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RetroReflection))),
      description: 'The reflections generated during the reflect phase of the retro',
      resolve: async ({id}, args, {dataLoader}) => {
        const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(id);
        reflections.sort((a,b) => a.sortOrder < b.sortOrder ? -1 : 1);
        return reflections;
      }
    }
  })
});

export default RetrospectiveMeeting;

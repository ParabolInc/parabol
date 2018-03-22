import {GraphQLList, GraphQLObjectType} from 'graphql';
import NewMeeting, {newMeetingFields} from 'server/graphql/types/NewMeeting';
import RetroReflectionGroup from 'server/graphql/types/RetroReflectionGroup';
import RetroReflection from 'server/graphql/types/RetroReflection';

const RetrospectiveMeeting = new GraphQLObjectType({
  name: 'RetrospectiveMeeting',
  interfaces: () => [NewMeeting],
  description: 'A retrospective meeting',
  fields: () => ({
    ...newMeetingFields(),
    reflectionGroups: {
      type: new GraphQLList(RetroReflectionGroup)
    },
    reflections: {
      type: new GraphQLList(RetroReflection),
      description: 'The reflections generated during the reflect phase of the retro',
      resolve: ({id}, args, {dataLoader}) => (
        dataLoader.get('retroReflectionsByMeetingId').load(id)
      )
    }
  })
});

export default RetrospectiveMeeting;

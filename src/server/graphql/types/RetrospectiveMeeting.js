import {GraphQLList, GraphQLObjectType} from 'graphql';
import NewMeeting, {newMeetingFields} from 'server/graphql/types/NewMeeting';
import RetroThoughtGroup from 'server/graphql/types/RetroThoughtGroup';
import RetroThought from 'server/graphql/types/RetroThought';

const RetrospectiveMeeting = new GraphQLObjectType({
  name: 'RetrospectiveMeeting',
  interfaces: () => [NewMeeting],
  description: 'A retrospective meeting',
  fields: () => ({
    ...newMeetingFields(),
    thoughtGroups: {
      type: new GraphQLList(RetroThoughtGroup)
    },
    thoughts: {
      type: new GraphQLList(RetroThought),
      description: 'The thoughts generated during the think phase of the retro'
    }
  })
});

export default RetrospectiveMeeting;

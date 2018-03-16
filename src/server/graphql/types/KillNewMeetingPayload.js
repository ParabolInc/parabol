import {GraphQLObjectType} from 'graphql';
import {resolveNewMeeting, resolveTeam} from 'server/graphql/resolvers';
import Team from 'server/graphql/types/Team';
import StandardMutationError from 'server/graphql/types/StandardMutationError';
import NewMeeting from 'server/graphql/types/NewMeeting';

const KillNewMeetingPayload = new GraphQLObjectType({
  name: 'KillNewMeetingPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    team: {
      type: Team,
      resolve: resolveTeam
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    }
  })
});

export default KillNewMeetingPayload;

import {GraphQLObjectType} from 'graphql';
import {resolveTeam} from 'server/graphql/resolvers';
import MeetingUpdatedNotification from 'server/graphql/types/MeetingUpdatedNotification';
import Team from 'server/graphql/types/Team';

const MeetingFacilitatorChanged = new GraphQLObjectType({
  name: 'MeetingFacilitatorChanged',
  fields: () => ({
    team: {
      type: Team,
      resolve: resolveTeam
    },
    notification: {
      type: MeetingUpdatedNotification,
      description: 'A notification triggered by a meeting action'
    }
  })
});

export default MeetingFacilitatorChanged;

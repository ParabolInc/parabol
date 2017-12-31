import {GraphQLObjectType} from 'graphql';
import {resolveNotification, resolveTeam} from 'server/graphql/resolvers';
import Team from 'server/graphql/types/Team';
import TeamRemovedNotification from 'server/graphql/types/TeamRemovedNotification';

const TeamRemoved = new GraphQLObjectType({
  name: 'TeamRemoved',
  fields: () => ({
    notification: {
      type: TeamRemovedNotification,
      description: 'The notification that a team was just archived or the viewer was just kicked out',
      resolve: resolveNotification
    },
    team: {
      type: Team,
      resolve: resolveTeam
    }
  })
});

export default TeamRemoved;

import {GraphQLObjectType} from 'graphql';
import {resolveAgendaItem, resolveTeam} from 'server/graphql/resolvers';
import AgendaItem from 'server/graphql/types/AgendaItem';
import Team from 'server/graphql/types/Team';

const MoveMeetingPayload = new GraphQLObjectType({
  name: 'MoveMeetingPayload',
  fields: () => ({
    team: {
      type: Team,
      resolve: resolveTeam
    },
    completedAgendaItem: {
      type: AgendaItem,
      description: 'The agendaItem completed, if any',
      resolve: resolveAgendaItem
    }
  })
});

export default MoveMeetingPayload;

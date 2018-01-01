import {GraphQLObjectType} from 'graphql';
import {resolveAgendaItem, resolveTeam} from 'server/graphql/resolvers';
import AgendaItem from 'server/graphql/types/AgendaItem';
import MeetingUpdatedNotification from 'server/graphql/types/MeetingUpdatedNotification';
import Team from 'server/graphql/types/Team';

const UpdateMeetingPayload = new GraphQLObjectType({
  name: 'UpdateMeetingPayload',
  fields: () => ({
    team: {
      type: Team,
      resolve: resolveTeam
    },
    completedAgendaItem: {
      type: AgendaItem,
      description: 'The agendaItem completed, if any',
      resolve: resolveAgendaItem
    },
    notification: {
      type: MeetingUpdatedNotification,
      description: 'A notification triggered by a meeting action'
    }
  })
});

export default UpdateMeetingPayload;

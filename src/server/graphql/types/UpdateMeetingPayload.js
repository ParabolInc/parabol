import {GraphQLNonNull, GraphQLObjectType} from 'graphql';
import AgendaItem from 'server/graphql/types/AgendaItem';
import Team from 'server/graphql/types/Team';

const UpdateMeetingPayload = new GraphQLObjectType({
  name: 'UpdateMeetingPayload',
  fields: () => ({
    team: {
      type: new GraphQLNonNull(Team)
    },
    completedAgendaItem: {
      type: AgendaItem,
      description: 'The agendaItem completed, if any'
    }
  })
});

export default UpdateMeetingPayload;

import {GraphQLObjectType} from 'graphql';
import {resolveTeam} from 'server/graphql/resolvers';
import NotifyFacilitatorDisconnected from 'server/graphql/types/NotifyFacilitatorDisconnected';
import Team from 'server/graphql/types/Team';

const PromoteFacilitatorPayload = new GraphQLObjectType({
  name: 'PromoteFacilitatorPayload',
  fields: () => ({
    team: {
      type: Team,
      description: 'Thea team currently running a meeting',
      resolve: resolveTeam
    },
    notification: {
      type: NotifyFacilitatorDisconnected,
      description: 'A notification stating that the facilitator disconnected and the new facilitator'
    }
  })
});

export default PromoteFacilitatorPayload;

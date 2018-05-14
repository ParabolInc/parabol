import {GraphQLObjectType} from 'graphql';
import {GROUP, REFLECT, VOTE} from 'universal/utils/constants';
import GroupPhaseCompletePayload from 'server/graphql/types/GroupPhaseCompletePayload';
import VotePhaseCompletePayload from 'server/graphql/types/VotePhaseCompletePayload';
import ReflectPhaseCompletePayload from 'server/graphql/types/ReflectPhaseCompletePayload';

const PhaseCompletePayload = new GraphQLObjectType({
  name: 'PhaseCompletePayload',
  fields: () => ({
    [REFLECT]: {
      type: ReflectPhaseCompletePayload,
      description: 'payload provided if the retro reflect phase was completed',
      resolve: (source) => source[REFLECT]
    },
    [GROUP]: {
      type: GroupPhaseCompletePayload,
      description: 'payload provided if the retro grouping phase was completed',
      resolve: (source) => source[GROUP]
    },
    [VOTE]: {
      type: VotePhaseCompletePayload,
      description: 'payload provided if the retro voting phase was completed',
      resolve: (source) => source[VOTE]
    }
  })
});

export default PhaseCompletePayload;

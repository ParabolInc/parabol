import {GraphQLObjectType} from 'graphql'
import {GROUP, VOTE, DISCUSS} from 'parabol-client/utils/constants'
import {GQLContext} from '../graphql'
import GroupPhaseInitializedPayload from './GroupPhaseInitializedPayload'
import DiscussPhaseInitializedPayload from './DiscussPhaseInitializedPayload'
import VotePhaseInitializedPayload from './VotePhaseInitializedPayload'

const PhaseInitializedPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'PhaseInitializedPayload',
  fields: () => ({
    [GROUP]: {
      type: GroupPhaseInitializedPayload,
      description: 'payload provided if the retro grouping phase was completed',
      resolve: (source) => source[GROUP]
    },
    [VOTE]: {
      type: VotePhaseInitializedPayload,
      description: 'payload provided if the retro voting phase was completed',
      resolve: (source) => source[VOTE]
    },
    [DISCUSS]: {
      type: DiscussPhaseInitializedPayload,
      description: 'payload provided if the retro reflect phase was completed',
      resolve: (source) => source[DISCUSS]
    }
  })
})

export default PhaseInitializedPayload

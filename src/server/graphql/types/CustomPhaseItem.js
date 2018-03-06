import {GraphQLBoolean, GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql';
import {RETRO_PHASE_ITEM} from 'universal/utils/constants';
import RetroPhaseItem from 'server/graphql/types/RetroPhaseItem';
import CustomPhaseItemTypeEnum from 'server/graphql/types/CustomPhaseItemTypeEnum';
import Team from 'server/graphql/types/Team';
import {resolveTeam} from 'server/graphql/resolvers';

export const customPhaseItemFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  type: {
    type: CustomPhaseItemTypeEnum,
    description: 'The type of phase item'
  },
  isActive: {
    type: GraphQLBoolean,
    description: 'true if the phase item is currently used by the team, else false'
  },
  team: {
    type: Team,
    description: 'The team that owns this customPhaseItem',
    resolve: resolveTeam
  }
});

const resolveTypeLookup = {
  [RETRO_PHASE_ITEM]: RetroPhaseItem
};

const CustomPhaseItem = new GraphQLInterfaceType({
  name: 'CustomPhaseItem',
  fields: customPhaseItemFields,
  resolveType: ({type}) => resolveTypeLookup[type]
});

export default CustomPhaseItem;

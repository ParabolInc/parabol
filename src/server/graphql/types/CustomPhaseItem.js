import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql';
import {RETRO_PHASE_ITEM} from 'universal/utils/constants';
import RetroPhaseItem from 'server/graphql/types/RetroPhaseItem';
import CustomPhaseItemTypeEnum from 'server/graphql/types/CustomPhaseItemTypeEnum';

export const customPhaseItemFields = {
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  type: {
    type: CustomPhaseItemTypeEnum,
    description: 'The type of phase item'
  }
};

const resolveTypeLookup = {
  [RETRO_PHASE_ITEM]: RetroPhaseItem
};

const CustomPhaseItem = new GraphQLInterfaceType({
  name: 'CustomPhaseItem',
  fields: () => customPhaseItemFields,
  resolveType: ({type}) => resolveTypeLookup[type]
});

export default CustomPhaseItem;

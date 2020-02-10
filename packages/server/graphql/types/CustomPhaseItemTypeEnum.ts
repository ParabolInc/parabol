import {GraphQLEnumType} from 'graphql'
import {RETRO_PHASE_ITEM} from '../../../client/utils/constants'

const CustomPhaseItemTypeEnum = new GraphQLEnumType({
  name: 'CustomPhaseItemTypeEnum',
  description: 'The type of phase item',
  values: {
    [RETRO_PHASE_ITEM]: {}
  }
})

export default CustomPhaseItemTypeEnum

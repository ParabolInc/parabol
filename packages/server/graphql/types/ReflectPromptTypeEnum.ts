import {GraphQLEnumType} from 'graphql'
import {RETRO_PHASE_ITEM} from 'parabol-client/utils/constants'

const ReflectPromptTypeEnum = new GraphQLEnumType({
  name: 'ReflectPromptTypeEnum',
  description: 'The type of phase item',
  values: {
    [RETRO_PHASE_ITEM]: {}
  }
})

export default ReflectPromptTypeEnum

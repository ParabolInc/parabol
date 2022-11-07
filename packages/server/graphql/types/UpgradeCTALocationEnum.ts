import {GraphQLEnumType} from 'graphql'

export type UpgradeCTALocationEnumType = 'publicTemplates'

const UpgradeCTALocationEnum = new GraphQLEnumType({
  name: 'UpgradeCTALocationEnum',
  description: 'Where the upgrade to pro CTA button was clicked',
  values: {
    publicTemplate: {}
  }
})

export default UpgradeCTALocationEnum

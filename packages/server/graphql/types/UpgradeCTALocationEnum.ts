import {GraphQLEnumType} from 'graphql'

export type UpgradeCTALocationEnumType = 'publicTemplates' | 'teamTemplate' | 'orgTemplate'

const UpgradeCTALocationEnum = new GraphQLEnumType({
  name: 'UpgradeCTALocationEnum',
  description: 'Where the upgrade to pro CTA button was clicked',
  values: {
    publicTemplate: {},
    teamTemplate: {},
    orgTemplate: {}
  }
})

export default UpgradeCTALocationEnum

import {GraphQLEnumType} from 'graphql'

export type UpgradeCTALocationEnumType =
  | 'publicTemplate'
  | 'teamTemplate'
  | 'orgTemplate'
  | 'createNewTemplate'
  | 'createTeam'
  | 'usageStats'

const UpgradeCTALocationEnum = new GraphQLEnumType({
  name: 'UpgradeCTALocationEnum',
  description: 'Where the upgrade to pro CTA button was clicked',
  values: {
    publicTemplate: {},
    teamTemplate: {},
    orgTemplate: {},
    createNewTemplate: {},
    createTeam: {},
    usageStats: {}
  }
})

export default UpgradeCTALocationEnum

import {GraphQLEnumType} from 'graphql'

export type UpgradeCTALocationEnumType =
  | 'publicTemplate'
  | 'teamTemplate'
  | 'orgTemplate'
  | 'createNewTemplate'
  | 'createTeam'
  | 'usageStats'
  | 'directMeetingLinkLock'
  | 'timelineHistoryLock'

const UpgradeCTALocationEnum = new GraphQLEnumType({
  name: 'UpgradeCTALocationEnum',
  description: 'Where the upgrade CTA button was clicked',
  values: {
    publicTemplate: {},
    teamTemplate: {},
    orgTemplate: {},
    createNewTemplate: {},
    createTeam: {},
    usageStats: {},
    directMeetingLinkLock: {},
    timelineHistoryLock: {}
  }
})

export default UpgradeCTALocationEnum

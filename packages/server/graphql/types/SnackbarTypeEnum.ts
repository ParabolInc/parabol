import {GraphQLEnumType} from 'graphql'

export type SnackbarTypeEnumType =
  | 'teamsLimitExceeded'
  | 'teamsLimitReminder'
  | 'promptToJoinOrg'
  | 'requestToJoinOrg'

const SnackbarTypeEnum = new GraphQLEnumType({
  name: 'SnackbarTypeEnum',
  values: {
    teamsLimitExceeded: {},
    teamsLimitReminder: {},
    promptToJoinOrg: {},
    requestToJoinOrg: {}
  }
})

export default SnackbarTypeEnum

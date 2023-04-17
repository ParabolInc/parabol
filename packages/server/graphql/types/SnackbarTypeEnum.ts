import {GraphQLEnumType} from 'graphql'

export type SnackbarTypeEnumType = 'teamsLimitExceeded' | 'teamsLimitReminder' | 'promptToJoinOrg'

const SnackbarTypeEnum = new GraphQLEnumType({
  name: 'SnackbarTypeEnum',
  values: {
    teamsLimitExceeded: {},
    teamsLimitReminder: {},
    promptToJoinOrg: {}
  }
})

export default SnackbarTypeEnum

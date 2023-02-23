import {GraphQLEnumType} from 'graphql'

export type SnackbarTypeEnumType = 'teamsLimitExceeded' | 'teamsLimitReminder'

const SnackbarTypeEnum = new GraphQLEnumType({
  name: 'SnackbarTypeEnum',
  values: {
    teamsLimitExceeded: {},
    teamsLimitReminder: {}
  }
})

export default SnackbarTypeEnum

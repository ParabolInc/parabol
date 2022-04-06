import {GraphQLEnumType} from 'graphql'

export type UserFeatureFlagEnum = 'spotlight' | 'standups' | 'gitlab' | 'azureDevOps'

const UserFlagEnum = new GraphQLEnumType({
  name: 'UserFlagEnum',
  description: 'A flag to give an individual user super powers',
  values: {
    spotlight: {},
    standups: {},
    gitlab: {},
    azureDevOps: {}
  }
})

export default UserFlagEnum

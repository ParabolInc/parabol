import {GraphQLEnumType} from 'graphql'

const values = {
  inviteYourTeam: {},
  tryTheDemo: {},
  tryRetroMeeting: {},
  createNewTeam: {},
  tryActionMeeting: {}
} as const

export type TSuggestedActionTypeEnum = keyof typeof values

const SuggestedActionTypeEnum = new GraphQLEnumType({
  name: 'SuggestedActionTypeEnum',
  description: 'The specific type of the suggested action',
  values
})

export default SuggestedActionTypeEnum

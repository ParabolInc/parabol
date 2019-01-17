import {GraphQLEnumType} from 'graphql'

// const defaultPriorities: {
//   1: 'demo',
//   2: 'invite',
//   3: 'retro',
//   4: 'createTeam',
//   5: 'action'
// }

const SuggestedActionTypeEnum = new GraphQLEnumType({
  name: 'SuggestedActionTypeEnum',
  description: 'The specific type of the suggested action',
  values: {
    inviteYourTeam: {},
    tryTheDemo: {},
    tryRetroMeeting: {},
    createNewTeam: {},
    tryActionMeeting: {}
  }
})

export default SuggestedActionTypeEnum

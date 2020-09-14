import {GraphQLEnumType} from 'graphql'

const SharableTemplateEnum = new GraphQLEnumType({
  name: 'SharableTemplateEnum',
  description: 'The type of the template',
  values: {
    RETROSPECTIVE: {},
    SPRINT_POKER: {}
  }
})

export default SharableTemplateEnum

import {GraphQLEnumType} from 'graphql'

export type TChangeSourceEnum = 'meeting' | 'task' | 'external'

const ChangeSourceEnum = new GraphQLEnumType({
  name: 'ChangeSourceEnum',
  description: 'The source that a change to a record came in through',
  values: {
    meeting: {},
    task: {},
    external: {}
  }
})

export default ChangeSourceEnum

import {GraphQLEnumType} from 'graphql'
import {ACTIVE, DONE, FUTURE, STUCK} from 'parabol-client/utils/constants'

const TaskStatusEnum = new GraphQLEnumType({
  name: 'TaskStatusEnum',
  description: 'The status of the task',
  values: {
    [ACTIVE]: {},
    [STUCK]: {},
    [DONE]: {},
    [FUTURE]: {}
  }
})

export type TaskStatusEnumType = typeof ACTIVE | typeof STUCK | typeof DONE | typeof FUTURE

export default TaskStatusEnum

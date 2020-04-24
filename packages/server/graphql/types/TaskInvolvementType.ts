import {GraphQLEnumType} from 'graphql'
import {ASSIGNEE, MENTIONEE} from 'parabol-client/utils/constants'

const TaskInvolvementType = new GraphQLEnumType({
  name: 'TaskInvolvementType',
  description: 'How a user is involved with a task (listed in hierarchical order)',
  values: {
    [ASSIGNEE]: {},
    [MENTIONEE]: {}
  }
})

export default TaskInvolvementType

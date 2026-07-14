import TaskSecondaryStatusId from '../../../../client/shared/gqlIds/TaskSecondaryStatusId'
import type {TaskSecondaryStatusResolvers} from '../resolverTypes'

const TaskSecondaryStatus: TaskSecondaryStatusResolvers = {
  id: ({id}) => TaskSecondaryStatusId.join(id),
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default TaskSecondaryStatus

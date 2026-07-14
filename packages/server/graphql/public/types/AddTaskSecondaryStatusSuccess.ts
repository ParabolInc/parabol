import type {AddTaskSecondaryStatusSuccessResolvers} from '../resolverTypes'

export type AddTaskSecondaryStatusSuccessSource = {
  taskSecondaryStatusId: number
  teamId: string
}

const AddTaskSecondaryStatusSuccess: AddTaskSecondaryStatusSuccessResolvers = {
  taskSecondaryStatus: ({taskSecondaryStatusId}, _args, {dataLoader}) => {
    return dataLoader.get('taskSecondaryStatuses').loadNonNull(taskSecondaryStatusId)
  },
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default AddTaskSecondaryStatusSuccess

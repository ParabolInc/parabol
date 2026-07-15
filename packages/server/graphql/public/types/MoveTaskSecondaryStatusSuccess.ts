import type {MoveTaskSecondaryStatusSuccessResolvers} from '../resolverTypes'

export type MoveTaskSecondaryStatusSuccessSource = {
  taskSecondaryStatusId: number
  teamId: string
}

const MoveTaskSecondaryStatusSuccess: MoveTaskSecondaryStatusSuccessResolvers = {
  taskSecondaryStatus: ({taskSecondaryStatusId}, _args, {dataLoader}) => {
    return dataLoader.get('taskSecondaryStatuses').loadNonNull(taskSecondaryStatusId)
  },
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default MoveTaskSecondaryStatusSuccess

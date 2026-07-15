import type {RenameTaskSecondaryStatusSuccessResolvers} from '../resolverTypes'

export type RenameTaskSecondaryStatusSuccessSource = {
  taskSecondaryStatusId: number
  teamId: string
}

const RenameTaskSecondaryStatusSuccess: RenameTaskSecondaryStatusSuccessResolvers = {
  taskSecondaryStatus: ({taskSecondaryStatusId}, _args, {dataLoader}) => {
    return dataLoader.get('taskSecondaryStatuses').loadNonNull(taskSecondaryStatusId)
  },
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default RenameTaskSecondaryStatusSuccess

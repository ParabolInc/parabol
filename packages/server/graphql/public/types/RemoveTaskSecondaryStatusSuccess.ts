import TaskSecondaryStatusId from '../../../../client/shared/gqlIds/TaskSecondaryStatusId'
import type {RemoveTaskSecondaryStatusSuccessResolvers} from '../resolverTypes'

export type RemoveTaskSecondaryStatusSuccessSource = {
  taskSecondaryStatusId: number
  teamId: string
}

const RemoveTaskSecondaryStatusSuccess: RemoveTaskSecondaryStatusSuccessResolvers = {
  removedTaskSecondaryStatusId: ({taskSecondaryStatusId}) =>
    TaskSecondaryStatusId.join(taskSecondaryStatusId),
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default RemoveTaskSecondaryStatusSuccess

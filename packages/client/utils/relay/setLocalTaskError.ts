import Atmosphere from '../../Atmosphere'
import {commitLocalUpdate} from 'relay-runtime'
import {ITask} from '../../types/graphql'

const setLocalTaskError = (atmosphere: Atmosphere, taskId: string, error: string | null) => {
  return commitLocalUpdate(atmosphere, (store) => {
    const task = store.get<ITask>(taskId)
    if (!task) return
    task.setValue(error, 'error')
  })
}

export default setLocalTaskError

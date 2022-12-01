import {commitLocalUpdate} from 'relay-runtime'
import Atmosphere from '../../Atmosphere'

const setLocalTaskError = (atmosphere: Atmosphere, taskId: string, error: string | null) => {
  return commitLocalUpdate(atmosphere, (store) => {
    const task = store.get(taskId)
    if (!task) return
    task.setValue(error, 'error')
  })
}

export default setLocalTaskError

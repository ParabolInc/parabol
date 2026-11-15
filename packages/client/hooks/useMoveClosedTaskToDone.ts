import {useEffect} from 'react'
import UpdateTaskMutation from '../mutations/UpdateTaskMutation'
import useAtmosphere from './useAtmosphere'

const movedTaskIds = new Set<string>()

const useMoveClosedTaskToDone = (taskId: string, isClosedInTool: boolean, isDone: boolean) => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    if (!isClosedInTool || isDone || movedTaskIds.has(taskId)) return
    movedTaskIds.add(taskId)
    UpdateTaskMutation(
      atmosphere,
      {updatedTask: {id: taskId, status: 'done'}},
      {onError: () => movedTaskIds.delete(taskId)}
    )
  }, [atmosphere, taskId, isClosedInTool, isDone])
}

export default useMoveClosedTaskToDone

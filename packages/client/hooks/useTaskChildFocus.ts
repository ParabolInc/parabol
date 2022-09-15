import {useEffect, useRef} from 'react'
import EditTaskMutation from '../mutations/EditTaskMutation'
import useAtmosphere from './useAtmosphere'
import useEventCallback from './useEventCallback'
import useRefState from './useRefState'

export type TaskChildName =
  | 'root'
  | 'dueDate'
  | 'teamAssignee'
  | 'userAssignee'
  | 'integrate'
  | 'tag'
  | 'editor-link-changer'
export type UseTaskChild = (taskChildName: TaskChildName) => void

const useTaskChildFocus = (taskId: string) => {
  const atmosphere = useAtmosphere()
  const [editingChildNameRef, setEditingChildName] = useRefState('')
  const lastIsEditingRef = useRef(false)
  const queueTimerRef = useRef<number | undefined>()
  useEffect(() => {
    return () => {
      window.clearTimeout(queueTimerRef.current)
    }
  }, [])

  const isTaskFocused = useEventCallback(() => {
    return editingChildNameRef.current !== ''
  })

  const queueEdit = () => {
    window.clearTimeout(queueTimerRef.current)
    queueTimerRef.current = window.setTimeout(() => {
      const isEditing = isTaskFocused()
      if (lastIsEditingRef.current !== isEditing) {
        lastIsEditingRef.current = isEditing
        EditTaskMutation(atmosphere, taskId, isEditing)
      }
    })
  }

  const addTaskChild = (taskChildName: TaskChildName) => {
    setEditingChildName(taskChildName)
    queueEdit()
  }

  const removeTaskChild = (taskChildName: TaskChildName) => {
    if (editingChildNameRef.current !== taskChildName) return
    setEditingChildName('')
    queueEdit()
  }

  const useTaskChild: UseTaskChild = (taskChildName) => {
    useEffect(() => {
      addTaskChild(taskChildName)
      return () => {
        removeTaskChild(taskChildName)
      }
    }, [])
  }

  return {addTaskChild, removeTaskChild, useTaskChild, isTaskFocused}
}

export default useTaskChildFocus

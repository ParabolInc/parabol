import {useEffect, useRef} from 'react'
import {Set} from 'immutable'
import EditTaskMutation from '../mutations/EditTaskMutation'
import useAtmosphere from './useAtmosphere'
import useRefState from './useRefState'

export type TaskChildName =
  'root'
  | 'dueDate'
  | 'teamAssignee'
  | 'userAssignee'
  | 'integrate'
  | 'tag'
  | 'editor-link-changer'
export type UseTaskChild = (taskChildName: TaskChildName) => void

const useTaskChildFocus = (taskId: string) => {
  const atmosphere = useAtmosphere()
  const [activeEditingComponentsRef, setActiveEditingComponents] = useRefState(() => Set())
  const lastIsEditingRef = useRef(false)
  const queueTimerRef = useRef<number | undefined>()

  const queueEdit = () => {
    window.clearTimeout(queueTimerRef.current)
    queueTimerRef.current = window.setTimeout(() => {
      const isEditing = !activeEditingComponentsRef.current.isEmpty()
      if (lastIsEditingRef.current !== isEditing) {
        lastIsEditingRef.current = isEditing
        EditTaskMutation(atmosphere, taskId, isEditing)
      }
    })
  }

  const addTaskChild = (taskChildName: TaskChildName) => {
    setActiveEditingComponents(activeEditingComponentsRef.current.add(taskChildName))
    queueEdit()
  }
  const removeTaskChild = (taskChildName: TaskChildName) => {
    setActiveEditingComponents(activeEditingComponentsRef.current.remove(taskChildName))
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
  return {addTaskChild, removeTaskChild, useTaskChild}
}

export default useTaskChildFocus

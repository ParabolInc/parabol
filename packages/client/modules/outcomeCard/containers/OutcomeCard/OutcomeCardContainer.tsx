import {ContentState, convertToRaw, EditorState} from 'draft-js'
import React, {memo, useEffect, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import editorDecorators from '../../../../components/TaskEditor/decorators'
import OutcomeCard from '../../components/OutcomeCard/OutcomeCard'
import DeleteTaskMutation from '../../../../mutations/DeleteTaskMutation'
import UpdateTaskMutation from '../../../../mutations/UpdateTaskMutation'
import mergeServerContent from '../../../../utils/mergeServerContent'
import isAndroid from '../../../../utils/draftjs/isAndroid'
import convertToTaskContent from '../../../../utils/draftjs/convertToTaskContent'
import graphql from 'babel-plugin-relay/macro'
import {AreaEnum, TaskStatusEnum} from '../../../../types/graphql'
import {OutcomeCardContainer_task} from '__generated__/OutcomeCardContainer_task.graphql'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useRefState from '../../../../hooks/useRefState'
import useTaskChildFocus from '../../../../hooks/useTaskChildFocus'

interface Props {
  area: AreaEnum
  contentState: ContentState
  isAgenda: boolean | undefined
  isDraggingOver: TaskStatusEnum | undefined
  task: OutcomeCardContainer_task
}

const OutcomeCardContainer = memo((props: Props) => {
  const {contentState, isDraggingOver, task, area, isAgenda} = props
  const {id: taskId, team} = task
  const {id: teamId} = team
  const atmosphere = useAtmosphere()
  const [isTaskHovered, setIsTaskHovered] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [editorStateRef, setEditorStateRef] = useRefState<EditorState>(() => {
    return EditorState.createWithContent(
      contentState,
      editorDecorators(() => editorStateRef.current)
    )
  })
  const {removeTaskChild, addTaskChild, useTaskChild, isTaskFocused} = useTaskChildFocus(taskId)

  const handleCardUpdate = () => {
    const isFocused = isTaskFocused()
    if (isAndroid) {
      const editorEl = editorRef.current
      if (!editorEl || editorEl.type !== 'textarea') return
      const {value} = editorEl
      if (!value && !isFocused) {
        DeleteTaskMutation(atmosphere, taskId, teamId)
      } else {
        const initialContentState = editorStateRef.current.getCurrentContent()
        const initialText = initialContentState.getPlainText()
        if (initialText === value) return
        const updatedTask = {
          id: taskId,
          content: convertToTaskContent(value)
        }
        UpdateTaskMutation(atmosphere, {updatedTask, area})
      }
      return
    }
    const nextContentState = editorStateRef.current.getCurrentContent()
    const hasText = nextContentState.hasText()
    if (!hasText && !isFocused) {
      DeleteTaskMutation(atmosphere, taskId, teamId)
    } else {
      const content = JSON.stringify(convertToRaw(nextContentState))
      const initialContent = JSON.stringify(convertToRaw(contentState))
      if (content === initialContent) return
      const updatedTask = {
        id: taskId,
        content
      }
      UpdateTaskMutation(atmosphere, {updatedTask, area})
    }
  }

  useEffect(() => {
    const editorState = editorStateRef.current
    if (!editorState || editorState.getCurrentContent() === contentState) return
    const newContentState = mergeServerContent(editorState, contentState)
    const newEditorState = EditorState.push(editorState, newContentState, 'insert-characters')
    setEditorStateRef(newEditorState)
  }, [contentState, editorStateRef])

  return (
    <div
      tabIndex={-1}
      style={{outline: 'none'}}
      onFocus={() => {
        // clicking into text requires this be triggered all the time
        addTaskChild('root')
      }}
      onBlur={() => {
        removeTaskChild('root')
        setTimeout(handleCardUpdate)
      }}
      onMouseEnter={() => setIsTaskHovered(true)}
      onMouseLeave={() => setIsTaskHovered(false)}
    >
      <OutcomeCard
        area={area}
        editorRef={editorRef}
        editorState={editorStateRef.current}
        isTaskFocused={isTaskFocused()}
        isTaskHovered={isTaskHovered}
        isAgenda={!!isAgenda}
        isDraggingOver={isDraggingOver}
        task={task}
        setEditorState={setEditorStateRef}
        useTaskChild={useTaskChild}
      />
    </div>
  )
})

export default createFragmentContainer(OutcomeCardContainer, {
  task: graphql`
    fragment OutcomeCardContainer_task on Task {
      editors {
        userId
      }
      id
      team {
        id
      }
      ...OutcomeCard_task
    }
  `
})

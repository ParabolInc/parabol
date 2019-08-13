import {ContentState, convertToRaw, EditorState} from 'draft-js'
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import editorDecorators from '../../../../components/TaskEditor/decorators'
import OutcomeCard from '../../components/OutcomeCard/OutcomeCard'
import DeleteTaskMutation from '../../../../mutations/DeleteTaskMutation'
import UpdateTaskMutation from '../../../../mutations/UpdateTaskMutation'
import mergeServerContent from '../../../../utils/mergeServerContent'
import isAndroid from '../../../../utils/draftjs/isAndroid'
import convertToTaskContent from '../../../../utils/draftjs/convertToTaskContent'
import graphql from 'babel-plugin-relay/macro'
import {AreaEnum} from '../../../../types/graphql'
import {OutcomeCardContainer_task} from '__generated__/OutcomeCardContainer_task.graphql'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useRefState from '../../../../hooks/useRefState'
import useTaskChildFocus from '../../../../hooks/useTaskChildFocus'

interface Props {
  area: AreaEnum
  contentState: ContentState,
  hasDragStyles: boolean | undefined,
  isAgenda: boolean | undefined,
  isDragging: boolean | undefined,
  task: OutcomeCardContainer_task
}

const OutcomeCardContainer = (props: Props) => {
  const {contentState, isDragging, task, area, hasDragStyles, isAgenda} = props
  const {id: taskId, editors, team} = task
  const {id: teamId} = team
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const [isTaskHovered, setIsTaskHovered] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const wasDraggingRef = useRef(isDragging)
  const [editorStateRef, setEditorStateRef] = useRefState<EditorState>(() => EditorState.createWithContent(contentState, editorDecorators(() => editorStateRef.current)))
  const {removeTaskChild, addTaskChild, useTaskChild} = useTaskChildFocus(taskId)

  const isTaskFocused = useMemo(() => {
    return !!editors.find((editor) => editor.userId === viewerId)
  }, [editors])

  const handleCardUpdateFallback = () => {
    const editorEl = editorRef.current
    if (!editorEl || editorEl.type !== 'textarea') return
    const {value} = editorEl
    if (!value) {
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
  }

  const handleCardUpdate = () => {
    if (isAndroid) {
      handleCardUpdateFallback()
      return
    }
    const nextContentState = editorStateRef.current.getCurrentContent()
    if (!nextContentState.hasText()) {
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

  const setEditorState = (newEditorState: EditorState) => {
    const editorState = editorStateRef.current
    if (!editorState) return
    const isFocused = newEditorState.getSelection().getHasFocus()
    if (!isFocused) {
      handleCardUpdate()
    }
    setEditorStateRef(newEditorState)
  }

  useEffect(() => {
    const editorState = editorStateRef.current
    if (!editorState || editorState.getCurrentContent() === contentState) return
    const newContentState = mergeServerContent(editorState, contentState)
    const newEditorState = EditorState.push(editorState, newContentState, 'insert-characters')
    setEditorState(newEditorState)
  }, [contentState])

  useEffect(() => {
    if (wasDraggingRef.current !== isDragging) {
      wasDraggingRef.current = isDragging
      handleCardUpdate()
    }
  }, [isDragging, wasDraggingRef])

  return (
    <div
      tabIndex={-1}
      style={{outline: 'none'}}
      onFocus={() => addTaskChild('root')}
      onBlur={() => removeTaskChild('root')}
      onMouseEnter={() => setIsTaskHovered(true)}
      onMouseLeave={() => setIsTaskHovered(false)}
    >
      <OutcomeCard
        area={area}
        editorRef={editorRef}
        editorState={editorStateRef.current}
        isTaskFocused={isTaskFocused}
        isTaskHovered={isTaskHovered}
        hasDragStyles={!!hasDragStyles}
        isAgenda={!!isAgenda}
        isDragging={!!isDragging}
        task={task}
        setEditorState={setEditorState}
        useTaskChild={useTaskChild}
      />
    </div>
  )
}

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

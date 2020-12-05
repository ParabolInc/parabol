import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import React, {useMemo, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {ParabolScopingSearchResultItem_task} from '../__generated__/ParabolScopingSearchResultItem_task.graphql'
import Checkbox from './Checkbox'
import useAtmosphere from '~/hooks/useAtmosphere'
import UpdatePokerScopeMutation from '~/mutations/UpdatePokerScopeMutation'
import {AreaEnum, TaskServiceEnum} from '~/types/graphql'
import {AddOrDeleteEnum} from '~/types/graphql'
import useMutationProps from '~/hooks/useMutationProps'
import {convertFromRaw, EditorState, ContentState, convertToRaw} from 'draft-js'
import editorDecorators from './TaskEditor/decorators'
import {PALETTE} from '~/styles/paletteV2'
import TaskEditor from './TaskEditor/TaskEditor'
import useRefState from '~/hooks/useRefState'
import useTaskChildFocus from '~/hooks/useTaskChildFocus'
import isAndroid from '~/utils/draftjs/isAndroid'
import convertToTaskContent from '~/utils/draftjs/convertToTaskContent'
import DeleteTaskMutation from '~/mutations/DeleteTaskMutation'
import UpdateTaskMutation from '~/mutations/UpdateTaskMutation'
import useScrollIntoView from '~/hooks/useScrollIntoVIew'

const Item = styled('div')<{isEditing: boolean}>(({isEditing}) => ({
  backgroundColor: isEditing ? PALETTE.BACKGROUND_BLUE_MAGENTA : 'transparent',
  cursor: isEditing ? undefined : 'pointer',
  display: 'flex',
  paddingLeft: 16,
  paddingTop: 8,
  paddingBottom: 8,
}))

const Task = styled('div')({
  paddingLeft: 16,
  width: '100%'
})

const StyledTaskEditor = styled(TaskEditor)({
  width: '100%',
  padding: '0 0',
  fontSize: '16px',
  lineHeight: 'normal',
  height: 'auto'
})

interface Props {
  meetingId: string
  isSelected: boolean
  task: ParabolScopingSearchResultItem_task
  teamId: string
  setIsEditing: (isEditing: boolean) => void
}

const ParabolScopingSearchResultItem = (props: Props) => {
  const {task, meetingId, isSelected, teamId, setIsEditing} = props
  const {id: taskId, content, plaintextContent} = task
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const contentState = useMemo(() => convertFromRaw(JSON.parse(content)), [content])
  const [editorStateRef, setEditorStateRef] = useRefState<EditorState>(() => {
    return EditorState.createWithContent(
      ContentState.createFromBlockArray([contentState.getFirstBlock()]),
      editorDecorators(() => editorStateRef.current)
    )
  })
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const {useTaskChild, addTaskChild, removeTaskChild, isTaskFocused} = useTaskChildFocus(taskId)
  const isEditing = !plaintextContent

  const onClick = () => {
    if (submitting || isEditing) return
    submitMutation()
    const variables = {
      meetingId,
      updates: [
        {
          service: TaskServiceEnum.PARABOL,
          serviceTaskId: taskId,
          action: isSelected ? AddOrDeleteEnum.DELETE : AddOrDeleteEnum.ADD
        }
      ]
    }
    UpdatePokerScopeMutation(atmosphere, variables, {onError, onCompleted})
  }

  const handleTaskUpdate = () => {
    const isFocused = isTaskFocused()
    const area = AreaEnum.meeting
    console.log('handle task update called')
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
    console.log(nextContentState)
    console.log(hasText, isFocused)
    if (!hasText && !isFocused) {
      console.log('deleting mutation')
      DeleteTaskMutation(atmosphere, taskId, teamId)
    } else {
      const content = JSON.stringify(convertToRaw(nextContentState))
      const initialContent = JSON.stringify(convertToRaw(contentState))
      console.log('comparing:', initialContent, content)
      if (content === initialContent) return
      const updatedTask = {
        id: taskId,
        content
      }
      UpdateTaskMutation(atmosphere, {updatedTask, area})
    }
  }

  const ref = useRef<HTMLDivElement>(null)
  useScrollIntoView(ref, isEditing)

  return (
    /* todo: shouldn't be able to check/ uncheck when editing */
    <Item onClick={onClick} isEditing={isEditing}>
      <Checkbox active={isSelected} />
      <Task
        onBlur={() => {
          removeTaskChild('root')
          setTimeout(handleTaskUpdate)
          setIsEditing(false)
        }}
        onFocus={() => addTaskChild('root')}
        ref={ref}
      >
        <StyledTaskEditor
          dataCy={`task`}
          editorRef={editorRef}
          readOnly={!!plaintextContent}
          editorState={editorStateRef.current}
          setEditorState={setEditorStateRef}
          teamId={teamId}
          useTaskChild={useTaskChild}
        />
      </Task>
    </Item>
  )
}

export default createFragmentContainer(ParabolScopingSearchResultItem, {
  task: graphql`
    fragment ParabolScopingSearchResultItem_task on Task {
      id
      content
      plaintextContent
      updatedAt
    }
  `
})

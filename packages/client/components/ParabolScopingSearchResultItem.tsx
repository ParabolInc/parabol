import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {ParabolScopingSearchResultItem_task} from '../__generated__/ParabolScopingSearchResultItem_task.graphql'
import Checkbox from './Checkbox'
import useAtmosphere from '~/hooks/useAtmosphere'
import UpdatePokerScopeMutation from '~/mutations/UpdatePokerScopeMutation'
import {AreaEnum, TaskServiceEnum} from '~/types/graphql'
import {AddOrDeleteEnum} from '~/types/graphql'
import useMutationProps from '~/hooks/useMutationProps'
import {convertToRaw} from 'draft-js'
import {PALETTE} from '~/styles/paletteV2'
import TaskEditor from './TaskEditor/TaskEditor'
import useTaskChildFocus from '~/hooks/useTaskChildFocus'
import isAndroid from '~/utils/draftjs/isAndroid'
import convertToTaskContent from '~/utils/draftjs/convertToTaskContent'
import DeleteTaskMutation from '~/mutations/DeleteTaskMutation'
import UpdateTaskMutation from '~/mutations/UpdateTaskMutation'
import useScrollIntoView from '~/hooks/useScrollIntoVIew'
import useEditorState from '~/hooks/useEditorState'
import {Threshold} from '../types/constEnums'

const Item = styled('div')<{isEditingThisItem: boolean}>(({isEditingThisItem}) => ({
  backgroundColor: isEditingThisItem ? PALETTE.BACKGROUND_BLUE_MAGENTA : 'transparent',
  cursor: isEditingThisItem ? undefined : 'pointer',
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
  usedServiceTaskIds: Set<string>
  task: ParabolScopingSearchResultItem_task
  teamId: string
  setIsEditing: (isEditing: boolean) => void
}

const ParabolScopingSearchResultItem = (props: Props) => {
  const {usedServiceTaskIds, task, meetingId, teamId, setIsEditing} = props
  const {id: serviceTaskId, content, plaintextContent} = task
  const isSelected = usedServiceTaskIds.has(serviceTaskId)
  const disabled = !isSelected && usedServiceTaskIds.size >= Threshold.MAX_POKER_STORIES
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const [editorState, setEditorState] = useEditorState(content)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const {useTaskChild, addTaskChild, removeTaskChild, isTaskFocused} = useTaskChildFocus(serviceTaskId)
  const isEditingThisItem = !plaintextContent

  const updatePokerScope = () => {
    if (submitting || disabled) return
    submitMutation()
    const variables = {
      meetingId,
      updates: [
        {
          service: TaskServiceEnum.PARABOL,
          serviceTaskId,
          action: isSelected ? AddOrDeleteEnum.DELETE : AddOrDeleteEnum.ADD
        }
      ]
    }
    UpdatePokerScopeMutation(atmosphere, variables, {onError, onCompleted})
  }

  const handleTaskUpdate = () => {
    const isFocused = isTaskFocused()
    const area = AreaEnum.meeting
    if (isAndroid) {
      const editorEl = editorRef.current
      if (!editorEl || editorEl.type !== 'textarea') return
      const {value} = editorEl
      if (!value && !isFocused) {
        DeleteTaskMutation(atmosphere, serviceTaskId, teamId)
      } else {
        const initialContentState = editorState.getCurrentContent()
        const initialText = initialContentState.getPlainText()
        if (initialText === value) return
        const updatedTask = {
          id: serviceTaskId,
          content: convertToTaskContent(value)
        }
        UpdateTaskMutation(atmosphere, {updatedTask, area}, {onCompleted: updatePokerScope})
      }
      return
    }
    const nextContentState = editorState.getCurrentContent()
    const hasText = nextContentState.hasText()
    if (!hasText && !isFocused) {
      DeleteTaskMutation(atmosphere, serviceTaskId, teamId)
    } else {
      const nextContent = JSON.stringify(convertToRaw(nextContentState))
      if (nextContent === content) return
      const updatedTask = {
        id: serviceTaskId,
        content: nextContent
      }
      UpdateTaskMutation(atmosphere, {updatedTask, area}, {onCompleted: updatePokerScope})
    }
  }

  const ref = useRef<HTMLDivElement>(null)
  useScrollIntoView(ref, isEditingThisItem)

  return (
    <Item
      onClick={() => {
        if (isEditingThisItem) return
        updatePokerScope()
      }}
      isEditingThisItem={isEditingThisItem}
    >
      <Checkbox active={isSelected || isEditingThisItem} disabled={disabled} />
      <Task
        onBlur={() => {
          if (!isEditingThisItem) return
          removeTaskChild('root')
          setTimeout(handleTaskUpdate)
          setIsEditing(false)
        }}
        onFocus={() => {
          if (!isEditingThisItem) return
          addTaskChild('root')
        }}
        ref={ref}
      >
        <StyledTaskEditor
          dataCy={`task`}
          editorRef={editorRef}
          readOnly={!isEditingThisItem}
          editorState={editorState}
          setEditorState={setEditorState}
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

import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {convertToRaw} from 'draft-js'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useEditorState from '~/hooks/useEditorState'
import useMutationProps from '~/hooks/useMutationProps'
import useScrollIntoView from '~/hooks/useScrollIntoVIew'
import useTaskChildFocus from '~/hooks/useTaskChildFocus'
import DeleteTaskMutation from '~/mutations/DeleteTaskMutation'
import UpdatePokerScopeMutation from '~/mutations/UpdatePokerScopeMutation'
import UpdateTaskMutation from '~/mutations/UpdateTaskMutation'
import {PALETTE} from '~/styles/paletteV3'
import convertToTaskContent from '~/utils/draftjs/convertToTaskContent'
import isAndroid from '~/utils/draftjs/isAndroid'
import {Threshold} from '../types/constEnums'
import {ParabolScopingSearchResultItem_task} from '../__generated__/ParabolScopingSearchResultItem_task.graphql'
import {UpdatePokerScopeMutationVariables} from '../__generated__/UpdatePokerScopeMutation.graphql'
import {AreaEnum} from '../__generated__/UpdateTaskMutation.graphql'
import Checkbox from './Checkbox'
import TaskEditor from './TaskEditor/TaskEditor'

const Item = styled('div')<{isEditingThisItem: boolean}>(({isEditingThisItem}) => ({
  backgroundColor: isEditingThisItem ? PALETTE.SLATE_100 : 'transparent',
  cursor: isEditingThisItem ? undefined : 'pointer',
  display: 'flex',
  paddingLeft: 16,
  paddingTop: 8,
  paddingBottom: 8
}))

const Task = styled('div')({
  width: '100%'
})

const StyledTaskEditor = styled(TaskEditor)({
  width: '100%',
  paddingTop: 4,
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
  const {useTaskChild, addTaskChild, removeTaskChild, isTaskFocused} =
    useTaskChildFocus(serviceTaskId)
  const isEditingThisItem = !plaintextContent

  const updatePokerScope = () => {
    if (submitting || disabled) return
    submitMutation()
    const variables = {
      meetingId,
      updates: [
        {
          service: 'PARABOL',
          serviceTaskId,
          action: isSelected ? 'DELETE' : 'ADD'
        }
      ]
    } as UpdatePokerScopeMutationVariables
    UpdatePokerScopeMutation(atmosphere, variables, {
      onError,
      onCompleted,
      contents: [plaintextContent]
    })
  }

  const handleTaskUpdate = () => {
    const isFocused = isTaskFocused()
    const area: AreaEnum = 'meeting'
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
      ref={ref}
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
      # grab title so the optimistic updater can use it to update sidebar
      title
      updatedAt
      integration {
        ... on JiraIssue {
          __typename
          summary
        }
        ... on _xGitHubIssue {
          __typename
          title
        }
      }
    }
  `
})

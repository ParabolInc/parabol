import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import useScrollIntoView from '~/hooks/useScrollIntoVIew'
import useTaskChildFocus from '~/hooks/useTaskChildFocus'
import DeleteTaskMutation from '~/mutations/DeleteTaskMutation'
import UpdatePokerScopeMutation from '~/mutations/UpdatePokerScopeMutation'
import UpdateTaskMutation from '~/mutations/UpdateTaskMutation'
import {ParabolScopingSearchResultItem_task$key} from '../__generated__/ParabolScopingSearchResultItem_task.graphql'
import {UpdatePokerScopeMutation as TUpdatePokerScopeMutation} from '../__generated__/UpdatePokerScopeMutation.graphql'
import {useTipTapTaskEditor} from '../hooks/useTipTapTaskEditor'
import {isEqualWhenSerialized} from '../shared/isEqualWhenSerialized'
import {Threshold} from '../types/constEnums'
import Checkbox from './Checkbox'
import {TipTapEditor} from './promptResponse/TipTapEditor'

interface Props {
  meetingId: string
  usedServiceTaskIds: Set<string>
  task: ParabolScopingSearchResultItem_task$key
  teamId: string
  setIsEditing: (isEditing: boolean) => void
}

const ParabolScopingSearchResultItem = (props: Props) => {
  const {usedServiceTaskIds, task: taskRef, meetingId, teamId, setIsEditing} = props
  const task = useFragment(
    graphql`
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
    `,
    taskRef
  )
  const {id: serviceTaskId, content, plaintextContent} = task
  const isSelected = usedServiceTaskIds.has(serviceTaskId)
  const disabled = !isSelected && usedServiceTaskIds.size >= Threshold.MAX_POKER_STORIES
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const isEditingThisItem = !plaintextContent
  const {editor} = useTipTapTaskEditor(content, {
    atmosphere,
    teamId,
    readOnly: !isEditingThisItem
  })
  const {useTaskChild, addTaskChild, removeTaskChild, isTaskFocused} =
    useTaskChildFocus(serviceTaskId)

  const editorLinkChanger = useTaskChild('editor-link-changer')

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
    } as TUpdatePokerScopeMutation['variables']
    UpdatePokerScopeMutation(atmosphere, variables, {
      onError,
      onCompleted,
      contents: [plaintextContent]
    })
  }

  const handleTaskUpdate = () => {
    if (!editor) return
    const isFocused = isTaskFocused()
    if (isFocused) return
    if (editor.isEmpty) {
      DeleteTaskMutation(atmosphere, {taskId: serviceTaskId})
      return
    }
    const nextContentJSON = editor.getJSON()
    if (isEqualWhenSerialized(nextContentJSON, JSON.parse(content))) return
    const updatedTask = {
      id: serviceTaskId,
      content: JSON.stringify(nextContentJSON)
    }
    UpdateTaskMutation(atmosphere, {updatedTask}, {})
  }

  const ref = useRef<HTMLDivElement>(null)
  useScrollIntoView(ref, isEditingThisItem)
  if (!editor) return null
  return (
    <div
      onClick={() => {
        if (isEditingThisItem) return
        updatePokerScope()
      }}
      className={`flex py-2 pl-4 ${isEditingThisItem ? 'bg-slate-100' : 'bg-transparent'} ${isEditingThisItem ? '' : 'cursor-pointer'}`}
      ref={ref}
    >
      <Checkbox active={isSelected || isEditingThisItem} disabled={disabled} />
      <div
        className='w-full'
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
        <TipTapEditor className='px-4' editor={editor} useLinkEditor={() => editorLinkChanger} />
      </div>
    </div>
  )
}

export default ParabolScopingSearchResultItem

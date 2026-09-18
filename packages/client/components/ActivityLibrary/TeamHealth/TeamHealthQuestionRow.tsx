import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {DeleteOutline, Edit} from '~/ui/icons'
import type {TeamHealthQuestionRow_question$key} from '../../../__generated__/TeamHealthQuestionRow_question.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useAddTeamHealthTemplateQuestionMutation from '../../../mutations/useAddTeamHealthTemplateQuestionMutation'
import useDeleteTeamHealthQuestionMutation from '../../../mutations/useDeleteTeamHealthQuestionMutation'
import useEditTeamHealthQuestionMutation from '../../../mutations/useEditTeamHealthQuestionMutation'
import useRemoveTeamHealthTemplateQuestionMutation from '../../../mutations/useRemoveTeamHealthTemplateQuestionMutation'
import {Checkbox} from '../../../ui/Checkbox/Checkbox'
import {cn} from '../../../ui/cn'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
import isTempId from '../../../utils/relay/isTempId'
import TeamHealthCategoryTag from './TeamHealthCategoryTag'

interface Props {
  questionRef: TeamHealthQuestionRow_question$key
  templateId: string
  viewerId: string
  isSelected: boolean
  isEditing: boolean
  // the viewer doesn't own this template; gray the checkbox but keep it clickable to hint at cloning
  readOnly: boolean
  onEditHint: () => void
  categories: ReadonlyArray<{id: string; name: string}>
}

const TeamHealthQuestionRow = (props: Props) => {
  const {
    questionRef,
    templateId,
    viewerId,
    isSelected,
    isEditing,
    readOnly,
    onEditHint,
    categories
  } = props
  const question = useFragment(
    graphql`
      fragment TeamHealthQuestionRow_question on TeamHealthQuestion {
        id
        question
        createdBy
        category {
          id
          name
        }
      }
    `,
    questionRef
  )
  const {id: questionId, question: text, createdBy, category} = question
  // question text/category may only be changed by its author, and only while the template is editable
  // an optimistic (temp-id) question has no server row to edit, select, or delete yet
  const isPending = isTempId(questionId)
  const canEdit = !!createdBy && createdBy === viewerId && isEditing && !isPending

  const atmosphere = useAtmosphere()
  const [addQuestion] = useAddTeamHealthTemplateQuestionMutation()
  const [removeQuestion] = useRemoveTeamHealthTemplateQuestionMutation()
  const [editQuestion] = useEditTeamHealthQuestionMutation(templateId)
  const [deleteQuestion] = useDeleteTeamHealthQuestionMutation(templateId)
  const [isEditingText, setIsEditingText] = useState(false)
  const [draft, setDraft] = useState(text)

  const onError = (err: Error) => {
    atmosphere.eventEmitter.emit('addSnackbar', {
      message: err.message,
      autoDismiss: 5,
      key: 'teamHealthQuestionError'
    })
  }

  const toggleSelected = (checked: boolean) => {
    if (!isEditing) return onEditHint()
    if (isPending) return
    const config = {variables: {templateId, questionIds: [questionId]}, onError}
    if (checked) {
      addQuestion(config)
    } else {
      removeQuestion(config)
    }
  }

  const startEditing = () => {
    if (!canEdit) return
    setDraft(text)
    setIsEditingText(true)
  }

  const submitEdit = () => {
    setIsEditingText(false)
    const trimmed = draft.trim()
    if (!trimmed || trimmed === text) {
      setDraft(text)
      return
    }
    editQuestion({variables: {questionId, question: trimmed}, onError})
  }

  const onDelete = () => {
    if (!canEdit) return
    deleteQuestion({variables: {questionId}, onError})
  }

  const editButton = (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            startEditing()
          }}
          aria-label='Edit question'
          className='flex shrink-0 cursor-pointer items-center text-fg-muted hover:text-fg-primary'
        >
          <Edit className='size-5' />
        </button>
      </TooltipTrigger>
      <TooltipContent>Edit question</TooltipContent>
    </Tooltip>
  )

  const deleteButton = (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          aria-label='Delete question'
          className='flex shrink-0 cursor-pointer items-center text-fg-muted hover:text-fg-error'
        >
          <DeleteOutline className='size-5' />
        </button>
      </TooltipTrigger>
      <TooltipContent>Delete question</TooltipContent>
    </Tooltip>
  )

  return (
    // the whole row is a click target for the checkbox; inner controls stop propagation
    <div
      className='group flex cursor-pointer flex-wrap items-center gap-1.5 rounded-md px-2 py-2 hover:bg-surface-hover sm:flex-nowrap'
      onClick={() => toggleSelected(!isSelected)}
    >
      <Checkbox
        className={cn('ml-5', readOnly && 'border-hairline')}
        checked={isSelected}
        onClick={(e) => e.stopPropagation()}
        onCheckedChange={(checked) => toggleSelected(checked === true)}
      />
      <div className='min-w-0 flex-1'>
        {isEditingText ? (
          <input
            autoFocus
            value={draft}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={submitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitEdit()
              else if (e.key === 'Escape') {
                setDraft(text)
                setIsEditingText(false)
              }
            }}
            className='w-full rounded-xs border border-accent border-solid bg-surface-input px-1 py-0.5 text-fg-primary text-sm outline-none'
          />
        ) : (
          <span className='wrap-break-word block min-w-0 select-none text-fg-primary text-sm'>
            {text}
          </span>
        )}
      </div>
      {/* built-in questions (no author) get no edit/delete affordance; the viewer only ever sees
          their own custom questions, so no owner tooltip is needed */}
      {canEdit && (
        <>
          {editButton}
          {deleteButton}
        </>
      )}
      <div className='flex basis-full pl-10.5 sm:contents'>
        <TeamHealthCategoryTag
          questionId={questionId}
          category={category}
          canEdit={canEdit}
          categories={categories}
        />
      </div>
    </div>
  )
}

export default TeamHealthQuestionRow

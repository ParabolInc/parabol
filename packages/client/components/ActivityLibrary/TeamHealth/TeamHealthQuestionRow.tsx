import {DeleteOutline, Edit} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
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
import TeamHealthCategoryTag from './TeamHealthCategoryTag'

interface Props {
  questionRef: TeamHealthQuestionRow_question$key
  templateId: string
  viewerId: string
  isSelected: boolean
  isEditing: boolean
  onEditHint: () => void
  categories: ReadonlyArray<{id: string; name: string}>
}

const TeamHealthQuestionRow = (props: Props) => {
  const {questionRef, templateId, viewerId, isSelected, isEditing, onEditHint, categories} = props
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
  const canEdit = !!createdBy && createdBy === viewerId && isEditing

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
          onClick={startEditing}
          aria-label='Edit question'
          className='flex shrink-0 cursor-pointer items-center text-slate-400 hover:text-slate-700'
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
          onClick={onDelete}
          aria-label='Delete question'
          className='flex shrink-0 cursor-pointer items-center text-slate-400 hover:text-tomato-500'
        >
          <DeleteOutline className='size-5' />
        </button>
      </TooltipTrigger>
      <TooltipContent>Delete question</TooltipContent>
    </Tooltip>
  )

  return (
    <div className='group flex items-center gap-1.5 rounded-md px-2 py-2 hover:bg-slate-100'>
      <Checkbox
        className='ml-3'
        checked={isSelected}
        onCheckedChange={(checked) => toggleSelected(checked === true)}
      />
      <div className='min-w-0 flex-1'>
        {isEditingText ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={submitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitEdit()
              else if (e.key === 'Escape') {
                setDraft(text)
                setIsEditingText(false)
              }
            }}
            className='w-full rounded-xs border border-sky-500 border-solid px-1 py-0.5 text-slate-700 text-sm outline-none'
          />
        ) : (
          <button
            type='button'
            onClick={startEditing}
            className={cn(
              'w-full text-left text-slate-700 text-sm',
              canEdit ? 'cursor-pointer' : 'cursor-default'
            )}
          >
            <span className='wrap-break-word min-w-0'>{text}</span>
          </button>
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
      <TeamHealthCategoryTag
        questionId={questionId}
        category={category}
        canEdit={canEdit}
        categories={categories}
      />
    </div>
  )
}

export default TeamHealthQuestionRow

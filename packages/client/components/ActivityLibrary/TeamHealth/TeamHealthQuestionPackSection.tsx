import * as Collapsible from '@radix-ui/react-collapsible'
import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import {KeyboardArrowRight, OpenInNew} from '~/ui/icons'
import type {TeamHealthQuestionPackSection_pack$key} from '../../../__generated__/TeamHealthQuestionPackSection_pack.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useAddTeamHealthTemplateQuestionMutation from '../../../mutations/useAddTeamHealthTemplateQuestionMutation'
import useRemoveTeamHealthTemplateQuestionMutation from '../../../mutations/useRemoveTeamHealthTemplateQuestionMutation'
import {Checkbox} from '../../../ui/Checkbox/Checkbox'
import {cn} from '../../../ui/cn'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
import isTempId from '../../../utils/relay/isTempId'
import {getTeamHealthCategoryDotColor} from './getTeamHealthCategoryColor'
import TeamHealthQuestionRow from './TeamHealthQuestionRow'

interface Props {
  packRef: TeamHealthQuestionPackSection_pack$key
  templateId: string
  viewerId: string
  isEditing: boolean
  // the viewer doesn't own this template; gray out the read-only checkboxes
  readOnly: boolean
  onEditHint: () => void
  defaultOpen: boolean
  selectedIds: ReadonlySet<string>
  categories: ReadonlyArray<{id: string; name: string}>
  // rendered after the last question row, e.g. the "Add a custom question" control on the org pack
  footer?: ReactNode
  // overrides the pack's stored name in the header, e.g. "Questions by {orgName}" for the org pack
  title?: string
}

const TeamHealthQuestionPackSection = (props: Props) => {
  const {
    packRef,
    templateId,
    viewerId,
    isEditing,
    readOnly,
    onEditHint,
    defaultOpen,
    selectedIds,
    categories,
    footer,
    title
  } = props
  const pack = useFragment(
    graphql`
      fragment TeamHealthQuestionPackSection_pack on TeamHealthQuestionPack {
        id
        name
        source
        sourceUrl
        questions {
          id
          category {
            id
          }
          ...TeamHealthQuestionRow_question
        }
      }
    `,
    packRef
  )
  const atmosphere = useAtmosphere()
  const [addQuestions, adding] = useAddTeamHealthTemplateQuestionMutation()
  const [removeQuestions, removing] = useRemoveTeamHealthTemplateQuestionMutation()

  const packQuestionIds = pack.questions.map((q) => q.id)
  const unselectedIds = packQuestionIds.filter((id) => !selectedIds.has(id))
  const allSelected = packQuestionIds.length > 0 && unselectedIds.length === 0
  const someSelected = unselectedIds.length < packQuestionIds.length
  const checked = allSelected ? true : someSelected ? 'indeterminate' : false
  // one dot per distinct category in the pack, in first-seen order
  const distinctCategoryIds = [
    ...new Set(pack.questions.map((q) => q.category.id).filter((id) => !isTempId(id)))
  ]
  // the globally-ordered category ids drive round-robin color assignment
  const orderedCategoryIds = categories.map((c) => c.id)

  const toggleAll = () => {
    if (!isEditing) return onEditHint()
    if (adding || removing || packQuestionIds.length === 0) return
    const onError = (err: Error) => {
      atmosphere.eventEmitter.emit('addSnackbar', {
        message: err.message,
        autoDismiss: 5,
        key: 'toggleAllTeamHealthQuestionsError'
      })
    }
    if (allSelected) {
      removeQuestions({variables: {templateId, questionIds: packQuestionIds}, onError})
    } else {
      addQuestions({variables: {templateId, questionIds: unselectedIds}, onError})
    }
  }

  const toggleAllCheckbox = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Checkbox
          className={cn('shrink-0', readOnly && 'border-hairline')}
          checked={checked}
          onCheckedChange={toggleAll}
          aria-label={allSelected ? 'Deselect all questions' : 'Select all questions'}
        />
      </TooltipTrigger>
      <TooltipContent>
        {allSelected ? 'Deselect all questions in this pack' : 'Select all questions in this pack'}
      </TooltipContent>
    </Tooltip>
  )

  const rows = pack.questions.map((question) => (
    <TeamHealthQuestionRow
      key={question.id}
      questionRef={question}
      templateId={templateId}
      viewerId={viewerId}
      isSelected={selectedIds.has(question.id)}
      categories={categories}
      isEditing={isEditing}
      readOnly={readOnly}
      onEditHint={onEditHint}
    />
  ))

  return (
    <Collapsible.Root defaultOpen={defaultOpen} className='border-hairline border-b'>
      <div className='flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 py-2 sm:flex-nowrap'>
        <Collapsible.Trigger asChild>
          <button
            type='button'
            aria-label='Toggle questions'
            className='group flex shrink-0 cursor-pointer items-center'
          >
            <KeyboardArrowRight className='size-5 shrink-0 text-fg-muted transition-transform group-data-[state=open]:rotate-90' />
          </button>
        </Collapsible.Trigger>
        {toggleAllCheckbox}
        <Collapsible.Trigger asChild>
          <button
            type='button'
            className='flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 text-left sm:flex-initial sm:flex-nowrap'
          >
            <span className='min-w-0 font-semibold text-fg-primary text-sm sm:shrink-0'>
              {title ?? pack.name}
            </span>
            <span className='shrink-0 rounded-full bg-surface-well px-2 py-0.5 font-medium text-fg-secondary text-xs'>
              {pack.questions.length} items
            </span>
            <span className='flex shrink-0 items-center gap-1'>
              {distinctCategoryIds.map((id) => (
                <span
                  key={id}
                  className={cn(
                    'size-2 rounded-full',
                    getTeamHealthCategoryDotColor(id, orderedCategoryIds)
                  )}
                />
              ))}
            </span>
          </button>
        </Collapsible.Trigger>
        {pack.source && (
          <div className='flex min-w-0 basis-full pl-13 sm:contents'>
            {pack.sourceUrl ? (
              <a
                href={pack.sourceUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='flex min-w-0 items-center gap-0.5 text-fg-muted text-xs hover:text-fg-secondary hover:underline'
              >
                <span className='truncate'>{pack.source}</span>
                <OpenInNew className='size-3.5 shrink-0' />
              </a>
            ) : (
              <span className='truncate text-fg-muted text-xs'>{pack.source}</span>
            )}
          </div>
        )}
      </div>
      <Collapsible.Content>
        <div className='pb-2'>
          {rows}
          {footer && <div className='px-1 pt-1'>{footer}</div>}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

export default TeamHealthQuestionPackSection

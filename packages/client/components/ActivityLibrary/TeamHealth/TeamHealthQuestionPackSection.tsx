import {KeyboardArrowRight, OpenInNew} from '@mui/icons-material'
import * as Collapsible from '@radix-ui/react-collapsible'
import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import type {TeamHealthQuestionPackSection_pack$key} from '../../../__generated__/TeamHealthQuestionPackSection_pack.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useAddTeamHealthTemplateQuestionMutation from '../../../mutations/useAddTeamHealthTemplateQuestionMutation'
import {Button} from '../../../ui/Button/Button'
import {cn} from '../../../ui/cn'
import {getTeamHealthCategoryDotColor} from './getTeamHealthCategoryColor'
import TeamHealthQuestionRow from './TeamHealthQuestionRow'

interface Props {
  packRef: TeamHealthQuestionPackSection_pack$key
  templateId: string
  viewerId: string
  isEditing: boolean
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
  const [addQuestions, submitting] = useAddTeamHealthTemplateQuestionMutation()

  const unselectedIds = pack.questions.filter((q) => !selectedIds.has(q.id)).map((q) => q.id)
  // one dot per distinct category in the pack, in first-seen order
  const distinctCategoryIds = [...new Set(pack.questions.map((q) => q.category.id))]
  // the globally-ordered category ids drive round-robin color assignment
  const orderedCategoryIds = categories.map((c) => c.id)

  const addAll = () => {
    if (!isEditing) return onEditHint()
    if (submitting || unselectedIds.length === 0) return
    addQuestions({
      variables: {templateId, questionIds: unselectedIds},
      onError: (err: Error) => {
        atmosphere.eventEmitter.emit('addSnackbar', {
          message: err.message,
          autoDismiss: 5,
          key: 'addAllTeamHealthQuestionsError'
        })
      }
    })
  }

  const addAllButton = (
    <Button
      variant='outline'
      className='shrink-0 border-slate-300 px-3 py-1 font-semibold text-slate-700 text-xs'
      onClick={addAll}
      disabled={isEditing && unselectedIds.length === 0}
    >
      Add all
    </Button>
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
      onEditHint={onEditHint}
    />
  ))

  return (
    <Collapsible.Root defaultOpen={defaultOpen} className='border-slate-200 border-b'>
      <div className='flex items-center justify-between gap-3 py-2'>
        <div className='flex min-w-0 flex-1 items-center gap-2'>
          <Collapsible.Trigger asChild>
            <button type='button' className='group flex min-w-0 items-center gap-2 text-left'>
              <KeyboardArrowRight className='size-5 shrink-0 text-slate-400 transition-transform group-data-[state=open]:rotate-90' />
              <span className='shrink-0 font-semibold text-slate-700 text-sm'>
                {title ?? pack.name}
              </span>
              <span className='shrink-0 rounded-full bg-slate-200 px-2 py-0.5 font-medium text-slate-600 text-xs'>
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
          {pack.source &&
            (pack.sourceUrl ? (
              <a
                href={pack.sourceUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='flex min-w-0 items-center gap-0.5 text-slate-400 text-xs hover:text-slate-600 hover:underline'
              >
                <span className='truncate'>{pack.source}</span>
                <OpenInNew className='size-3.5 shrink-0' />
              </a>
            ) : (
              <span className='truncate text-slate-400 text-xs'>{pack.source}</span>
            ))}
        </div>
        {addAllButton}
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

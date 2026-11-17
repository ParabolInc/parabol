import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamPromptTemplateCard_template$key} from '~/__generated__/TeamPromptTemplateCard_template.graphql'
import {Check} from '~/ui/icons'
import {cn} from '../../../ui/cn'
import {Spinner} from '../../../ui/Spinner/Spinner'

const PREVIEW_COUNT = 3

interface Props {
  templateRef: TeamPromptTemplateCard_template$key
  isCurrent: boolean
  isPending: boolean
  isDisabled: boolean
  onPick: () => void
}

const TeamPromptTemplateCard = (props: Props) => {
  const {templateRef, isCurrent, isPending, isDisabled, onPick} = props
  const template = useFragment(
    graphql`
      fragment TeamPromptTemplateCard_template on MeetingTemplate {
        name
        ... on PromptTemplate {
          prompts {
            id
            question
          }
        }
      }
    `,
    templateRef
  )
  const prompts = template.prompts ?? []
  const preview = prompts.slice(0, PREVIEW_COUNT)
  const hiddenCount = prompts.length - preview.length
  const isDimmed = isDisabled && !isCurrent && !isPending
  return (
    <button
      type='button'
      onClick={onPick}
      disabled={isDisabled || isCurrent}
      aria-current={isCurrent ? 'true' : undefined}
      aria-label={isCurrent ? `${template.name}, current template` : `Switch to ${template.name}`}
      className={cn(
        'flex w-full cursor-pointer flex-col gap-2.5 rounded-xl border border-hairline bg-surface-card p-3 text-left transition-shadow hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-accent',
        isCurrent && 'cursor-default border-2 border-accent-active p-[11px] hover:shadow-none',
        isPending && 'shadow-card-hover',
        isDimmed && 'cursor-default opacity-50 hover:shadow-none'
      )}
    >
      <div className='flex items-start gap-2.5'>
        <div
          className='flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-aqua-100 font-semibold text-aqua-800 dark:bg-aqua-400/20 dark:text-aqua-200'
          aria-hidden
        >
          <span className='text-base leading-[18px]'>{prompts.length}</span>
          <span className='text-[9px] uppercase leading-[10px] tracking-wide'>Qs</span>
        </div>
        <div className='min-w-0 flex-1'>
          <div className='line-clamp-2 font-semibold text-fg-primary text-sm'>{template.name}</div>
          <div className='text-fg-muted text-xs'>
            {prompts.length} {prompts.length === 1 ? 'question' : 'questions'}
          </div>
        </div>
        {isCurrent && (
          <span className='flex h-[22px] shrink-0 items-center gap-1 rounded-full bg-accent-active pr-2 pl-1.5 font-semibold text-white text-xs dark:text-grape-950'>
            <Check className='size-4' />
            Current
          </span>
        )}
        {isPending && (
          <span className='flex h-[22px] shrink-0 items-center gap-1.5 font-semibold text-fg-secondary text-xs'>
            <Spinner className='h-4 w-4' />
            Switching…
          </span>
        )}
      </div>
      <ol className='m-0 flex list-none flex-col gap-1 py-0 pr-0 pl-[50px]'>
        {preview.map(({id, question}) => (
          <li key={id} className='truncate text-[13px] text-fg-secondary leading-[18px]'>
            {question}
          </li>
        ))}
        {hiddenCount > 0 && <li className='text-fg-muted text-xs'>+{hiddenCount} more</li>}
      </ol>
    </button>
  )
}

export default TeamPromptTemplateCard

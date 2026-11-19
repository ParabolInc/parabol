import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroTemplateCard_template$key} from '../../__generated__/RetroTemplateCard_template.graphql'
import {cn} from '../../ui/cn'
import {Check, ExpandMore} from '../../ui/icons'
import {backgroundImgMap} from '../ActivityLibrary/backgroundImgMap'
import {CATEGORY_ID_TO_NAME, CATEGORY_THEMES, type CategoryID} from '../ActivityLibrary/Categories'
import RetroTemplatePromptList from './RetroTemplatePromptList'

interface Props {
  templateRef: RetroTemplateCard_template$key
  searchQuery: string
  isCurrent: boolean
  isPending: boolean
  isExpanded: boolean
  onPick: () => void
  onToggleExpanded: () => void
}

const RetroTemplateCard = (props: Props) => {
  const {templateRef, searchQuery, isCurrent, isPending, isExpanded, onPick, onToggleExpanded} =
    props
  const template = useFragment(
    graphql`
      fragment RetroTemplateCard_template on MeetingTemplate {
        ...RetroTemplatePromptList_template
        name
        category
        illustrationUrl
      }
    `,
    templateRef
  )
  const {name, illustrationUrl} = template
  const category = template.category as CategoryID
  const backgroundSrc = backgroundImgMap[category as keyof typeof backgroundImgMap]
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-hairline bg-surface-card',
        isCurrent && '-m-px border-2 border-accent-active'
      )}
    >
      <div className='flex items-stretch'>
        <button
          type='button'
          onClick={onPick}
          aria-current={isCurrent ? 'true' : undefined}
          aria-label={isCurrent ? `${name}, current template` : `Switch to ${name}`}
          className={cn(
            'grid min-w-0 flex-1 cursor-pointer grid-cols-[88px_minmax(0,1fr)] items-center gap-3 border-none bg-transparent py-3 pl-3 text-left focus-visible:outline-2 focus-visible:outline-accent',
            isCurrent && 'cursor-default'
          )}
        >
          <span
            aria-hidden
            className={cn(
              'relative block h-[55px] w-[88px] overflow-hidden rounded-md',
              CATEGORY_THEMES[category]?.secondary
            )}
          >
            {backgroundSrc && (
              <img src={backgroundSrc} alt='' className='absolute inset-0 size-full object-cover' />
            )}
            <img
              src={illustrationUrl}
              alt=''
              className='absolute inset-0 size-full object-contain p-1.5'
            />
          </span>
          <span className='flex min-w-0 flex-col gap-0.5'>
            <span className='font-semibold text-[15px] text-fg-primary leading-5'>{name}</span>
            <span className='flex h-5 items-center gap-2'>
              <span className='font-semibold text-fg-secondary text-xs italic'>
                {CATEGORY_ID_TO_NAME[category]}
              </span>
              {isCurrent && (
                <span className='flex h-5 items-center gap-0.5 rounded-full bg-accent-active pr-2 pl-1 font-semibold text-white text-xs dark:text-grape-950'>
                  <Check className='size-3.5' />
                  Current
                </span>
              )}
              {isPending && (
                <span className='font-semibold text-fg-secondary text-xs'>Switching…</span>
              )}
            </span>
          </span>
        </button>
        <button
          type='button'
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Hide' : 'Show'} the prompts in ${name}`}
          title={isExpanded ? 'Hide prompts' : 'Show prompts'}
          onClick={onToggleExpanded}
          className='flex w-12 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent text-fg-secondary'
        >
          <span
            className={cn(
              'flex size-8 items-center justify-center rounded-md hover:bg-surface-hover',
              isExpanded && 'bg-surface-hover'
            )}
          >
            <ExpandMore className={cn('transition-transform', isExpanded && 'rotate-180')} />
          </span>
        </button>
      </div>
      {isExpanded && <RetroTemplatePromptList templateRef={template} searchQuery={searchQuery} />}
    </div>
  )
}

export default RetroTemplateCard

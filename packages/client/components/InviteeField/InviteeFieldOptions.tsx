import * as Popover from '@radix-ui/react-popover'
import {type RefObject, type SyntheticEvent, useState} from 'react'
import {cn} from '../../ui/cn'
import menuSectionTitleClass from '../../ui/Menu/menuSectionTitleClass'
import {
  describeInviteeOption,
  type InviteeOption,
  type InviteeOptions
} from '../../utils/inviteeOptions'
import InviteeFieldOption from './InviteeFieldOption'

interface Props {
  inputRef: RefObject<HTMLInputElement | null>
  listId: string
  options: InviteeOptions
  orgName: string
  query: string
  active: InviteeOption | null
  isPointerActive: boolean
  getOptionDomId: (option: InviteeOption) => string
  onHighlight: (option: InviteeOption) => void
  onPick: (option: InviteeOption) => void
}

const keepInputFocus = (e: Event | SyntheticEvent) => e.preventDefault()

const ROOMY_BELOW = 240

const pickSide = (anchor: HTMLElement | null): 'top' | 'bottom' => {
  if (!anchor) return 'bottom'
  const {top, bottom} = anchor.getBoundingClientRect()
  const below = window.innerHeight - bottom
  return below >= ROOMY_BELOW || below >= top ? 'bottom' : 'top'
}

const InviteeFieldOptions = (props: Props) => {
  const {inputRef, listId, options, orgName, query, active, isPointerActive} = props
  const {getOptionDomId, onHighlight, onPick} = props
  const {sections, emptyText} = options
  const hasQuery = query.trim() !== ''
  const [side] = useState(() => pickSide(inputRef.current?.parentElement ?? null))
  return (
    <Popover.Portal>
      <Popover.Content
        role='presentation'
        side={side}
        align='start'
        avoidCollisions={false}
        sideOffset={4}
        collisionPadding={8}
        onOpenAutoFocus={keepInputFocus}
        onCloseAutoFocus={keepInputFocus}
        onMouseDown={keepInputFocus}
        className='z-30 flex max-h-[min(28rem,var(--radix-popover-content-available-height))] w-(--radix-popper-anchor-width) flex-col overflow-hidden rounded-md border border-hairline bg-surface-raised pt-1 text-fg-primary shadow-[var(--shadow-card-raised)] outline-hidden data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'
      >
        <div
          id={listId}
          role='listbox'
          aria-multiselectable
          aria-label={hasQuery ? 'Matches' : 'Suggestions'}
          className='min-h-0 overflow-y-auto'
        >
          {sections.map((section) => {
            const headingId = `${listId}-${section.id}-heading`
            return (
              <div
                key={section.id}
                role='group'
                aria-labelledby={headingId}
                className='not-first:mt-1 not-first:border-hairline not-first:border-t not-first:pt-1'
              >
                <div
                  id={headingId}
                  aria-hidden
                  className={cn(
                    menuSectionTitleClass,
                    'flex items-baseline justify-between gap-2 px-3'
                  )}
                >
                  <span>{section.title}</span>
                  {section.count !== null && <span className='font-normal'>{section.count}</span>}
                </div>
                {section.options.map((option) => (
                  <InviteeFieldOption
                    key={option.id}
                    option={option}
                    domId={getOptionDomId(option)}
                    isHighlighted={option.id === active?.id}
                    isPointerActive={isPointerActive}
                    onHighlight={onHighlight}
                    onPick={onPick}
                  />
                ))}
              </div>
            )
          })}
        </div>
        {emptyText && (
          <p className='m-0 px-3 pt-1.5 pb-2.5 text-fg-secondary text-sm'>{emptyText}</p>
        )}
        <div className='mt-1 flex shrink-0 items-center gap-1.5 border-hairline border-t px-3 py-2 text-fg-secondary text-xs leading-4'>
          {active ? (
            <>
              <kbd className='inline-flex h-[18px] items-center rounded-sm border border-hairline-strong px-[5px] font-sans font-semibold text-[11px] text-fg-primary'>
                Enter
              </kbd>
              <span>{describeInviteeOption(active)}</span>
            </>
          ) : (
            <span>{`Type a name to search everyone at ${orgName}, or type an email.`}</span>
          )}
        </div>
      </Popover.Content>
    </Popover.Portal>
  )
}

export default InviteeFieldOptions

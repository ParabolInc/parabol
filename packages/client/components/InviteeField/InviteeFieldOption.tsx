import {Check, ExpandMore, Groups, MailOutline} from '~/ui/icons'
import {cn} from '../../ui/cn'
import {type InviteeOption, isOptionEnabled} from '../../utils/inviteeOptions'
import InviteeAvatar from './InviteeAvatar'

interface Props {
  option: InviteeOption
  domId: string
  isHighlighted: boolean
  isPointerActive: boolean
  onHighlight: (option: InviteeOption) => void
  onPick: (option: InviteeOption) => void
}

const getOptionText = (option: InviteeOption) => {
  switch (option.kind) {
    case 'person':
      return {name: option.person.name, sub: option.person.email}
    case 'team':
      return {name: option.team.name, sub: option.sub}
    case 'email':
      return {name: `Invite ${option.email}`, sub: option.sub}
    case 'showMore':
      return {name: `Show ${option.count} more`, sub: null}
  }
}

const FADE_WHEN_DISABLED = 'group-aria-disabled:opacity-50'

const InviteeFieldOption = (props: Props) => {
  const {option, domId, isHighlighted, isPointerActive, onHighlight, onPick} = props
  const isEnabled = isOptionEnabled(option)
  const {name, sub} = getOptionText(option)
  const TileIcon =
    option.kind === 'team' ? Groups : option.kind === 'email' ? MailOutline : ExpandMore
  return (
    <div
      id={domId}
      role='option'
      aria-selected={option.kind === 'person' && option.isAdded}
      aria-disabled={!isEnabled || undefined}
      data-highlighted={isHighlighted || undefined}
      onClick={() => onPick(option)}
      onPointerMove={() => {
        if (isEnabled) onHighlight(option)
      }}
      className={cn(
        'group mx-1 flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-fg-secondary text-xs leading-4 aria-disabled:cursor-default data-highlighted:bg-surface-hover',
        isEnabled && isPointerActive && 'hover:bg-surface-hover'
      )}
    >
      {option.kind === 'person' ? (
        <InviteeAvatar
          name={option.person.name}
          picture={option.person.picture}
          className={FADE_WHEN_DISABLED}
        />
      ) : (
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-well text-fg-primary',
            FADE_WHEN_DISABLED
          )}
        >
          <TileIcon className='text-lg' />
        </span>
      )}
      <div className='flex min-w-0 flex-col'>
        <span
          className={cn(
            'truncate font-semibold text-fg-primary text-sm leading-5',
            FADE_WHEN_DISABLED
          )}
        >
          {name}
        </span>
        {sub && (
          <span className={cn('truncate', option.kind === 'person' && FADE_WHEN_DISABLED)}>
            {sub}
          </span>
        )}
      </div>
      {option.kind === 'person' &&
        (option.isAdded ? (
          <span className='ml-auto flex shrink-0 items-center gap-1 font-semibold text-fg-primary'>
            <Check className='text-base' />
            Added
          </span>
        ) : (
          option.meta && <span className='ml-auto shrink-0 text-right'>{option.meta}</span>
        ))}
      {option.kind === 'team' && (
        <span
          className={cn(
            'ml-auto flex h-7 shrink-0 items-center whitespace-nowrap rounded-sm border border-hairline-strong bg-surface-card px-2.5 font-semibold text-[13px] text-fg-primary group-data-highlighted:border-fg-primary',
            FADE_WHEN_DISABLED
          )}
        >
          {option.actionLabel}
        </span>
      )}
    </div>
  )
}

export default InviteeFieldOption

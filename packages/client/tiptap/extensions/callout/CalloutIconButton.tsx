import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {CALLOUT_TONE_LABELS, type CalloutTone} from '../../../shared/tiptap/calloutTones'
import {cn} from '../../../ui/cn'
import {CalloutToneIcon} from './CalloutToneIcon'

interface Props extends ComponentPropsWithoutRef<'button'> {
  tone: CalloutTone
  emoji: string | null
}

export const CalloutIconButton = forwardRef<HTMLButtonElement, Props>(
  ({tone, emoji, className, ...props}, ref) => (
    <button
      ref={ref}
      type='button'
      contentEditable={false}
      aria-label={`Callout style: ${CALLOUT_TONE_LABELS[tone]}`}
      aria-haspopup='menu'
      className={cn(
        'flex h-[26px] w-7 shrink-0 cursor-pointer select-none items-center justify-center rounded-md outline-hidden hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent data-[state=open]:bg-surface-hover',
        className
      )}
      {...props}
    >
      <CalloutToneIcon tone={tone} emoji={emoji} className='pointer-events-none' />
    </button>
  )
)

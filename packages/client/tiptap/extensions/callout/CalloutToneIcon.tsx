import type {CalloutTone} from '../../../shared/tiptap/calloutTones'
import {cn} from '../../../ui/cn'
import {CALLOUT_TONE_STYLES} from './calloutToneStyles'

interface Props {
  tone: CalloutTone
  emoji: string | null
  className?: string
}

export const CalloutToneIcon = ({tone, emoji, className}: Props) => {
  if (emoji) {
    return (
      <span aria-hidden className={cn('text-[18px] leading-none', className)}>
        {emoji}
      </span>
    )
  }
  const {Icon, iconClass} = CALLOUT_TONE_STYLES[tone]
  return <Icon className={cn('text-[20px]', iconClass, className)} />
}

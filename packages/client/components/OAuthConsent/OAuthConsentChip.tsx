import {cn} from '../../ui/cn'
import type {IconComponent} from '../../ui/icons/IconComponent'

const TONE_CLASSES = {
  ok: 'bg-jade-100 text-jade-800 dark:bg-jade-500/20 dark:text-jade-300',
  warn: 'bg-gold-100 text-gold-800 dark:bg-gold-500/20 dark:text-gold-300',
  block:
    'bg-slate-200 text-fg-secondary ring-1 ring-hairline-strong ring-inset dark:bg-lilac-300/12'
}

interface Props {
  tone: keyof typeof TONE_CLASSES
  Icon: IconComponent
  label: string
}

const OAuthConsentChip = ({tone, Icon, label}: Props) => (
  <span
    className={cn(
      'inline-flex h-[22px] shrink-0 items-center gap-1 whitespace-nowrap rounded-full pr-2 pl-1.5 font-semibold text-xs leading-4',
      TONE_CLASSES[tone]
    )}
  >
    <Icon className='text-sm' />
    {label}
  </span>
)

export default OAuthConsentChip

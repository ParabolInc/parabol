import type {Ref} from 'react'
import {KeyboardArrowLeft} from '~/ui/icons'
import {cn} from '../../../ui/cn'
import type {InspirationVariant} from './InspirationPresentationContext'

interface Props {
  variant: InspirationVariant
  buttonRef?: Ref<HTMLButtonElement>
  onClick: () => void
}

const InspirationDraftBackRow = (props: Props) => {
  const {variant, buttonRef, onClick} = props
  return (
    <button
      ref={buttonRef}
      type='button'
      aria-label='Back to your draft'
      onClick={onClick}
      className={cn(
        'flex shrink-0 cursor-pointer items-center gap-1 px-3 font-semibold text-[13px] text-fg-secondary hover:bg-surface-hover',
        variant === 'sheet' ? 'h-11' : 'h-10'
      )}
    >
      <KeyboardArrowLeft className='h-5 w-5' />
      Your draft
    </button>
  )
}

export default InspirationDraftBackRow

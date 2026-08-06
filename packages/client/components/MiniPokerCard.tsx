import type {ReactNode} from 'react'
import PassSVG from '../../../static/images/icons/no_entry.svg'
import {PokerCards} from '../types/constEnums'
import {cn} from '../ui/cn'
import getPokerCardBackground from '../utils/getPokerCardBackground'

interface Props {
  canEdit?: boolean
  color?: string
  children: ReactNode
  isFinal?: boolean
  onClick?: () => void
}

const MiniPokerCard = (props: Props) => {
  const {canEdit, color, children, onClick, isFinal} = props
  return (
    <div
      onClick={onClick}
      style={color ? {background: getPokerCardBackground(color)} : undefined}
      className={cn(
        'flex h-10 w-7 shrink-0 select-none items-center justify-center rounded-[2px] text-center font-semibold text-[18px] leading-6 [text-shadow:0px_1px_1px_rgba(0,0,0,0.1)]',
        color ? 'border-0 text-white' : 'bg-surface-card text-fg-secondary',
        !color &&
          (isFinal
            ? 'border border-hairline-strong border-solid'
            : 'border border-hairline-strong border-dashed'),
        onClick || canEdit ? 'cursor-pointer' : 'cursor-default',
        (onClick || canEdit) && 'hover:shadow-[var(--shadow-card-hover)]',
        onClick ? '[transition:all_200ms]' : 'transition-none'
      )}
    >
      {children === PokerCards.PASS_CARD ? (
        <img className='block h-4 w-4 select-none' src={PassSVG} />
      ) : (
        children
      )}
    </div>
  )
}

export default MiniPokerCard

import type {ReactNode} from 'react'
import {Button} from '../../ui/Button/Button'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'

interface Props {
  label: string
  onClick: () => void
  children: ReactNode
}

export const TipTapLinkPreviewButton = (props: Props) => {
  const {label, onClick, children} = props
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type='button'
          aria-label={label}
          onClick={onClick}
          className='h-7 w-7 rounded-xs text-[18px] text-fg-secondary hover:bg-surface-hover focus-visible:bg-surface-hover'
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

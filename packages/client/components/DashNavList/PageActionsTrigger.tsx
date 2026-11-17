import {forwardRef, type HTMLAttributes, type RefObject} from 'react'
import {MoreVert as MoreVertIcon} from '~/ui/icons'
import {cn} from '../../ui/cn'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'

interface Props extends HTMLAttributes<HTMLDivElement> {
  isMenuOpen: boolean
  buttonRef: RefObject<HTMLButtonElement | null>
}

export const PageActionsTrigger = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {isMenuOpen, buttonRef, ...triggerProps} = props
  return (
    <div ref={ref} {...triggerProps}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            ref={buttonRef}
            type='button'
            aria-label={'More page actions'}
            className={cn(
              'hidden size-5 cursor-pointer items-center justify-center group-hover:flex',
              isMenuOpen && 'flex'
            )}
          >
            <MoreVertIcon className='size-5' />
          </button>
        </TooltipTrigger>
        <TooltipContent side={'bottom'}>{'More page actions'}</TooltipContent>
      </Tooltip>
    </div>
  )
})

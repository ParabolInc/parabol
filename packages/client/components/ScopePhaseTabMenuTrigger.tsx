import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {Button} from '../ui/Button/Button'
import {ArrowDropDown} from '../ui/icons'

interface Props extends ComponentPropsWithoutRef<typeof Button> {
  moreCount: number
}

const ScopePhaseTabMenuTrigger = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const {moreCount, ...rest} = props
  return (
    <Button
      {...rest}
      ref={ref}
      aria-label={`${moreCount} more integrations`}
      className='flex-none gap-1 rounded-none rounded-tr-lg py-3 pr-1 pl-3 font-semibold text-fg-secondary text-sm leading-5 data-[state=open]:bg-surface-hover'
      variant='flat'
    >
      <span>{moreCount} more</span>
      <ArrowDropDown className='size-5' />
    </Button>
  )
})

export default ScopePhaseTabMenuTrigger

import type {ComponentPropsWithoutRef} from 'react'
import {Button} from '../ui/Button/Button'
import {cn} from '../ui/cn'
import {Menu} from '../ui/icons'

interface Props extends ComponentPropsWithoutRef<'button'> {
  dataCy?: string
}

const SidebarToggle = (props: Props) => {
  const {dataCy, className, ...rest} = props
  return (
    <Button
      {...rest}
      size='default'
      className={cn(
        'bg-transparent p-0 text-[14px] text-fg-primary leading-5 shadow-none outline-0 hover:text-accent focus:text-accent active:text-accent',
        'h-6 p-0 text-fg-secondary hover:text-fg-secondary focus:text-fg-secondary active:text-fg-secondary',
        className
      )}
      data-cy={`${dataCy}-toggle`}
      aria-label='Toggle the sidebar'
      type='button'
    >
      <div className='flex h-6 w-6 items-center justify-center text-inherit [&_svg]:text-[24px]'>
        <Menu />
      </div>
    </Button>
  )
}
export default SidebarToggle

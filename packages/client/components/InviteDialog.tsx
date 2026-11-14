import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {cn} from '../ui/cn'

const InviteDialog = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>((props, ref) => {
  const {className, children, ...rest} = props
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col rounded-lg bg-surface-card shadow-[var(--shadow-dialog)]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
})

export default InviteDialog

import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {cn} from '../ui/cn'

const DialogContainer = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  (props, ref) => {
    const {className, children, ...rest} = props
    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto my-0 flex max-h-[90vh] w-[512px] min-w-[280px] max-w-[calc(100vw-48px)] flex-col rounded-lg bg-surface-card shadow-[var(--shadow-dialog)]',
          className
        )}
        {...rest}
      >
        {children}
      </div>
    )
  }
)

export default DialogContainer

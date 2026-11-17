import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {cn} from '../../ui/cn'

export const TeamPromptBadge = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  (props, ref) => {
    const {className, children, ...rest} = props
    return (
      <div
        ref={ref}
        className={cn(
          'flex min-h-[34px] select-none items-center justify-center rounded-full bg-surface-card px-4 py-[6px] font-semibold text-[14px] text-fg-primary',
          className
        )}
        {...rest}
      >
        {children}
      </div>
    )
  }
)

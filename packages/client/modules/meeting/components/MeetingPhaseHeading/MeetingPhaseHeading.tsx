import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {cn} from '../../../../ui/cn'

const MeetingPhaseHeading = forwardRef(
  (props: ComponentPropsWithoutRef<'div'>, ref: Ref<HTMLDivElement>) => {
    const {className, children, ...rest} = props
    return (
      <div
        ref={ref}
        className={cn(
          'text-left font-semibold text-[34px] text-fg-primary leading-[1.25]',
          className
        )}
        {...rest}
      >
        {children}
      </div>
    )
  }
)

export default MeetingPhaseHeading

import {forwardRef, type HTMLAttributes, type Ref} from 'react'
import {cn} from '../ui/cn'

interface Props extends HTMLAttributes<HTMLDivElement> {
  height?: string | number
  minHeight?: string | number
}

const MeetingSidebarPhaseItemChild = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {height, minHeight, className, style, children, ...rest} = props
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col overflow-hidden [transition:height_300ms_cubic-bezier(0,0,.2,1),min-height_300ms_cubic-bezier(0,0,.2,1)]',
        className
      )}
      style={{height, minHeight, ...style}}
      {...rest}
    >
      {children}
    </div>
  )
})

export default MeetingSidebarPhaseItemChild

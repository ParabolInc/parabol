import {forwardRef, type HTMLAttributes} from 'react'
import {Filter} from '../../types/constEnums'
import {cn} from '../../ui/cn'

interface Props extends HTMLAttributes<HTMLDivElement> {
  hasOverlay?: boolean
}

const DashContent = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {hasOverlay, className, style, children, ...rest} = props
  return (
    <div
      ref={ref}
      // overflow-auto omitted because @hello-pangea/dnd only supports 1 scrolling parent
      className={cn('flex h-full min-h-0 w-full flex-1 flex-col bg-surface-app', className)}
      style={{filter: hasOverlay ? Filter.BENEATH_DIALOG : undefined, ...style}}
      {...rest}
    >
      {children}
    </div>
  )
})

export default DashContent

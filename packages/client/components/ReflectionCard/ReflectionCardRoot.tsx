import {forwardRef} from 'react'
import {cn} from '../../ui/cn'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  showDragHintAnimation?: boolean
}

const ReflectionCardRoot = forwardRef<HTMLDivElement, Props>(
  ({showDragHintAnimation, className, ...rest}, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative block w-74 max-w-full rounded-card bg-surface-card shadow-card transition-shadow',
          showDragHintAnimation && 'animate-drag-hint',
          className
        )}
        {...rest}
      />
    )
  }
)

export default ReflectionCardRoot

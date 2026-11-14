import {forwardRef, type ReactNode} from 'react'
import {cn} from '../../ui/cn'

interface Props {
  children?: ReactNode
  className?: string
}

const HelpMenuCopy = forwardRef<HTMLParagraphElement, Props>((props, ref) => {
  const {className, children} = props
  return (
    <p ref={ref} className={cn('m-0 mb-[1em]', className)}>
      {children}
    </p>
  )
})

export default HelpMenuCopy

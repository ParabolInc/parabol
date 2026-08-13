import {forwardRef, type ReactNode, type Ref} from 'react'
import TooltipStyled from '../components/TooltipStyled'
import {cn} from '../ui/cn'
import {PortalStatus} from './usePortal'

const backgroundClasses = (portalStatus: PortalStatus) => {
  switch (portalStatus) {
    case PortalStatus.Mounted:
    case PortalStatus.Entering:
      return 'opacity-0 [transform:scale(0)] transition-all duration-150 ease-out'
    case PortalStatus.Entered:
      return 'opacity-100 [transform:scale(1)] transition-all duration-150 ease-out'
    case PortalStatus.Exiting:
      return 'opacity-0 transition-all duration-75 ease-out'
    default:
      return undefined
  }
}

interface Props {
  portalStatus: PortalStatus
  className?: string
  children?: ReactNode
}

const TooltipBackground = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {portalStatus, className, children} = props
  return (
    <TooltipStyled ref={ref} className={cn('z-[-1]', backgroundClasses(portalStatus), className)}>
      {children}
    </TooltipStyled>
  )
})

export default TooltipBackground

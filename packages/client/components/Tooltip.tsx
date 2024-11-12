import clsx from 'clsx'
import {ReactNode} from 'react'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'

interface Props {
  text: ReactNode
  children: ReactNode
  className?: string
}

const Tooltip = (props: Props) => {
  const {text, children, className} = props
  const {openTooltip, closeTooltip, tooltipPortal, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )

  return (
    <div
      onMouseEnter={openTooltip}
      onMouseLeave={closeTooltip}
      className={clsx('cursor-pointer', className)}
      ref={originRef}
    >
      {children}
      {tooltipPortal(text)}
    </div>
  )
}

export default Tooltip

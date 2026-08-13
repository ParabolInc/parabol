import {forwardRef, type Ref} from 'react'
import {cn} from '../ui/cn'
import {MenuPosition} from './useCoords'
import {PortalStatus} from './usePortal'

const transformOriginClasses = {
  [MenuPosition.UPPER_RIGHT]: 'origin-top-right',
  [MenuPosition.UPPER_LEFT]: 'origin-top-left',
  [MenuPosition.LOWER_LEFT]: 'origin-bottom-left',
  [MenuPosition.LOWER_RIGHT]: 'origin-bottom-right'
} as const

const backgroundClasses = (portalStatus: PortalStatus, isDropdown: boolean) => {
  switch (portalStatus) {
    case PortalStatus.Entering:
    case PortalStatus.Entered:
      return cn(
        'opacity-100 transition-all duration-150 ease-out',
        isDropdown ? '[transform:scaleY(1)]' : '[transform:scale(1)]'
      )
    case PortalStatus.Exiting:
      return 'opacity-0 transition-all duration-[120ms] ease-out'
    case PortalStatus.Mounted:
      return isDropdown ? '[transform:scaleY(0)]' : '[transform:scale(0)]'
    default:
      return undefined
  }
}

interface BackgroundProps {
  menuPosition: MenuPosition
  portalStatus: PortalStatus
  isDropdown: boolean
  className?: string
}

const MenuBackground = forwardRef((props: BackgroundProps, ref: Ref<HTMLDivElement>) => {
  const {menuPosition, portalStatus, isDropdown, className} = props
  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-[-1] h-full w-full rounded bg-surface-card shadow-[var(--shadow-card-raised)]',
        transformOriginClasses[menuPosition as keyof typeof transformOriginClasses],
        backgroundClasses(portalStatus, isDropdown),
        className
      )}
    />
  )
})

export default MenuBackground

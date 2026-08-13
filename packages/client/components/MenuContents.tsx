import {forwardRef, type ReactNode, type Ref} from 'react'
import {PortalStatus} from '../hooks/usePortal'
import {cn} from '../ui/cn'

export interface MenuContentsProps {
  minWidth?: number
  menuContentStyles?: any
  portalStatus: PortalStatus
  className?: string
  children?: ReactNode
}

const MenuContents = forwardRef((props: MenuContentsProps, ref: Ref<HTMLDivElement>) => {
  const {minWidth, menuContentStyles = {}, portalStatus, className, children} = props
  const isOpening = portalStatus === PortalStatus.Entering || portalStatus === PortalStatus.Entered
  return (
    <div
      ref={ref}
      className={cn(
        'w-full rounded-[4px] py-2 text-left outline-none',
        portalStatus >= PortalStatus.Entered ? 'overflow-y-auto' : 'overflow-y-hidden',
        isOpening
          ? 'opacity-100 [transition:opacity_150ms_cubic-bezier(0,0,.2,1)]'
          : portalStatus === PortalStatus.Exiting
            ? 'opacity-0'
            : 'opacity-0 [transition:opacity_100ms_cubic-bezier(0,0,.2,1)]',
        className
      )}
      style={{minWidth, ...menuContentStyles}}
    >
      {children}
    </div>
  )
})

export default MenuContents

import type {ReactNode} from 'react'
import useBreakpoint from '../hooks/useBreakpoint'
import {Breakpoint} from '../types/constEnums'
import {cn} from '../ui/cn'
import StaticSidebar from './StaticSidebar'
import SwipeableDashSidebar from './SwipeableDashSidebar'

interface Props {
  children: ReactNode
  isOpen: boolean
  onToggle: () => void
  isRightDrawer?: boolean
  sidebarWidth?: number
  isDesktop?: boolean
}

const ResponsiveDashSidebar = (props: Props) => {
  const {children, isOpen, onToggle, isRightDrawer = false, sidebarWidth, isDesktop} = props
  const isDesktopDefault = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const showDesktopView = isDesktop ?? isDesktopDefault
  if (showDesktopView) {
    return (
      <StaticSidebar isOpen={isOpen} isRightDrawer={isRightDrawer} sidebarWidth={sidebarWidth}>
        <div
          className={cn(
            'h-full transition-shadow duration-200 ease-[cubic-bezier(0,0,.2,1)]',
            isOpen
              ? 'shadow-[0px_2px_4px_-1px_rgba(0,0,0,.2),0px_4px_5px_0px_rgba(0,0,0,.14),0px_1px_10px_0px_rgba(0,0,0,.12)]'
              : 'shadow-[0px_0px_0px_0px_rgba(0,0,0,.2),0px_0px_0px_0px_rgba(0,0,0,.14),0px_0px_0px_0px_rgba(0,0,0,.12)]'
          )}
        >
          {children}
        </div>
      </StaticSidebar>
    )
  }
  return (
    <SwipeableDashSidebar
      isOpen={isOpen}
      isRightDrawer={isRightDrawer}
      onToggle={onToggle}
      sidebarWidth={sidebarWidth}
    >
      {children}
    </SwipeableDashSidebar>
  )
}

export default ResponsiveDashSidebar

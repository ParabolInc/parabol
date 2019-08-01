import {useCallback} from 'react'
import useHotkey from './useHotkey'
import useRefState from './useRefState'
import useBreakpoint from './useBreakpoint'
import {DASH_SIDEBAR} from '../components/Dashboard/DashSidebar'

const useSidebar = () => {
  const isDesktop = useBreakpoint(DASH_SIDEBAR.BREAKPOINT)
  const [isOpen, setIsOpen] = useRefState(isDesktop)
  const open = useCallback(() => {
    setIsOpen(true)
  }, [setIsOpen])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  const toggle = useCallback(() => {
    setIsOpen(!isOpen.current)
  }, [isOpen, setIsOpen])

  const handleMenuClick = useCallback(() => {
    if (isOpen.current && !isDesktop) {
      setIsOpen(false)
    }
  }, [isDesktop, isOpen, setIsOpen])

  useHotkey(`shift+left`, close)
  useHotkey(`shift+right`, open)
  return {isOpen: isOpen.current, toggle, handleMenuClick}
}

export default useSidebar

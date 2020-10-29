import {useCallback} from 'react'
import useHotkey from './useHotkey'
import useRefState from './useRefState'
import useBreakpoint from './useBreakpoint'
import {Breakpoint} from '../types/constEnums'

const testToRemove = false

const useSidebar = () => {
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const [isOpen, setIsOpen] = useRefState(testToRemove)
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

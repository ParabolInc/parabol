import {useLayoutEffect} from 'react'
import {commitLocalUpdate} from 'react-relay'
import {Breakpoint} from '~/types/constEnums'
import useAtmosphere from './useAtmosphere'
import useBreakpoint from './useBreakpoint'

const useRightDrawer = (meetingId: string, defaultTab = 'discussion') => {
  const atmosphere = useAtmosphere()
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  const toggleDrawer = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      if (!meeting) return
      const isOpen = meeting.getValue('rightDrawerOpen') != null
      const isCommentUnread = meeting.getValue('isCommentUnread')
      if (isOpen && isCommentUnread) {
        meeting.setValue(false, 'isCommentUnread')
      }
      meeting.setValue(isOpen ? null : defaultTab, 'rightDrawerOpen')
    })
  }

  const setActiveTab = (tabId: string) => {
    commitLocalUpdate(atmosphere, (store) => {
      store.get(meetingId)?.setValue(tabId, 'rightDrawerOpen')
    })
  }

  const setDrawerOpen = (isOpen: boolean) => {
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      if (!meeting) return
      meeting.setValue(isOpen ? defaultTab : null, 'rightDrawerOpen')
    })
  }
  useLayoutEffect(() => {
    setDrawerOpen(isDesktop)
    return () => {
      setDrawerOpen(false)
    }
  }, [isDesktop])

  return [toggleDrawer, setActiveTab] as const
}

export default useRightDrawer

import {useEffect} from 'react'
import {commitLocalUpdate} from 'relay-runtime'
import {INewMeeting} from '../types/graphql'
import useAtmosphere from './useAtmosphere'

const useMobileSidebarDefaultClosed = (isDesktop: boolean, meetingId: string) => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get<INewMeeting>(meetingId)
      if (!meeting) return
      meeting.setValue(isDesktop, 'showSidebar')
    })
  }, [isDesktop])
}

export default useMobileSidebarDefaultClosed

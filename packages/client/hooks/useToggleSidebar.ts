import {useCallback} from 'react'
import {commitLocalUpdate} from 'relay-runtime'
import useAtmosphere from './useAtmosphere'

export const useToggleSidebar = (meetingId: string) => {
  const atmosphere = useAtmosphere()
  return useCallback(() => {
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      if (!meeting) return
      const val = meeting.getValue('showSidebar')
      meeting.setValue(!val, 'showSidebar')
    })
  }, [atmosphere, meetingId])
}

export default useToggleSidebar

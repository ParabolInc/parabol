import {useCallback} from 'react'
import {commitLocalUpdate} from 'relay-runtime'
import useAtmosphere from './useAtmosphere'

const useHandleMenuClick = (meetingId: string, isDesktop: boolean) => {
  const atmosphere = useAtmosphere()
  return useCallback(() => {
    if (isDesktop) return
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      if (!meeting) return
      const val = meeting.getValue('showSidebar')
      if (val) {
        meeting.setValue(false, 'showSidebar')
      }
    })
  }, [atmosphere, meetingId, isDesktop])
}

export default useHandleMenuClick

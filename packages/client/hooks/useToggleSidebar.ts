import useAtmosphere from './useAtmosphere'
import {useCallback} from 'react'
import {commitLocalUpdate} from 'relay-runtime'
import {INewMeeting} from '../types/graphql'

export const useToggleSidebar = (meetingId: string) => {
  const atmosphere = useAtmosphere()
  return useCallback(() => {
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get<INewMeeting>(meetingId)
      if (!meeting) return
      const val = meeting.getValue('showSidebar')
      meeting.setValue(!val, 'showSidebar')
    })
  }, [atmosphere, meetingId])
}

export default useToggleSidebar

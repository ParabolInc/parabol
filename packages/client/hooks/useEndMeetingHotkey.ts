import useAtmosphere from './useAtmosphere'
import useRouter from './useRouter'
import handleHotkey from '../utils/meetings/handleHotkey'
import EndNewMeetingMutation from '../mutations/EndNewMeetingMutation'
import useHotkey from './useHotkey'

const useEndMeetingHotkey = (meetingId: string) => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const endMeeting = handleHotkey(() => {
    EndNewMeetingMutation(atmosphere, {meetingId}, {history})
  })
  useHotkey('i c a n t h a c k i t', endMeeting)
}

export default useEndMeetingHotkey

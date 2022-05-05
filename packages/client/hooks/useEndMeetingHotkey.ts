import EndCheckInMutation from '~/mutations/EndCheckInMutation'
import EndRetrospectiveMutation from '~/mutations/EndRetrospectiveMutation'
import EndSprintPokerMutation from '~/mutations/EndSprintPokerMutation'
import {MeetingTypeEnum} from '~/__generated__/NewMeetingQuery.graphql'
import handleHotkey from '../utils/meetings/handleHotkey'
import useAtmosphere from './useAtmosphere'
import useHotkey from './useHotkey'
import useRouter from './useRouter'

const useEndMeetingHotkey = (meetingId: string, meetingType: MeetingTypeEnum) => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const endMeeting = handleHotkey(() => {
    if (meetingType === 'action') {
      EndCheckInMutation(atmosphere, {meetingId}, {history})
    } else if (meetingType === 'retrospective') {
      EndRetrospectiveMutation(atmosphere, {meetingId}, {history})
    } else if (meetingType === 'poker') {
      EndSprintPokerMutation(atmosphere, {meetingId}, {history})
    }
  })
  useHotkey('i c a n t h a c k i t', endMeeting)
}

export default useEndMeetingHotkey

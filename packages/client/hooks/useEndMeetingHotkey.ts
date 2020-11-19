import useAtmosphere from './useAtmosphere'
import useRouter from './useRouter'
import handleHotkey from '../utils/meetings/handleHotkey'
import useHotkey from './useHotkey'
import EndCheckInMutation from '~/mutations/EndCheckInMutation'
import {MeetingTypeEnum} from '../types/graphql'
import EndRetrospectiveMutation from '~/mutations/EndRetrospectiveMutation'
import EndSprintPokerMutation from '~/mutations/EndSprintPokerMutation'

const useEndMeetingHotkey = (meetingId: string, meetingType: MeetingTypeEnum) => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const endMeeting = handleHotkey(() => {
    if (meetingType === MeetingTypeEnum.action) {
      EndCheckInMutation(atmosphere, {meetingId}, {history})
    } else if (meetingType === MeetingTypeEnum.retrospective) {
      EndRetrospectiveMutation(atmosphere, {meetingId}, {history})
    } else if (meetingType === MeetingTypeEnum.poker) {
      EndSprintPokerMutation(atmosphere, {meetingId}, {history})
    }
  })
  useHotkey('i c a n t h a c k i t', endMeeting)
}

export default useEndMeetingHotkey

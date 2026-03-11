import {useNavigate} from 'react-router'
import type {MeetingTypeEnum} from '~/__generated__/MeetingSelectorQuery.graphql'
import EndCheckInMutation from '~/mutations/EndCheckInMutation'
import EndRetrospectiveMutation from '~/mutations/EndRetrospectiveMutation'
import EndSprintPokerMutation from '~/mutations/EndSprintPokerMutation'
import handleHotkey from '../utils/meetings/handleHotkey'
import useAtmosphere from './useAtmosphere'
import useHotkey from './useHotkey'

const useEndMeetingHotkey = (meetingId: string, meetingType: MeetingTypeEnum) => {
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const endMeeting = handleHotkey(() => {
    if (meetingType === 'action') {
      EndCheckInMutation(atmosphere, {meetingId}, {navigate})
    } else if (meetingType === 'retrospective') {
      EndRetrospectiveMutation(atmosphere, {meetingId}, {navigate})
    } else if (meetingType === 'poker') {
      EndSprintPokerMutation(atmosphere, {meetingId}, {navigate})
    }
  })
  useHotkey('i c a n t h a c k i t', endMeeting)
}

export default useEndMeetingHotkey

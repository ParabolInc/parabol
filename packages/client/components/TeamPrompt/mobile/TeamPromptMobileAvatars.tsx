import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamPromptMobileAvatars_meeting$key} from '~/__generated__/TeamPromptMobileAvatars_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import MeetingOverflowMenu from '~/modules/meeting/components/MeetingAvatarGroup/MeetingOverflowMenu'
import NewMeetingAvatar from '~/modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatar'

const MAX_AVATARS = 3
const slotClassName = 'relative -ml-3 rounded-full bg-surface-app p-px first:ml-0'

interface Props {
  meetingRef: TeamPromptMobileAvatars_meeting$key
}

const TeamPromptMobileAvatars = ({meetingRef}: Props) => {
  const meeting = useFragment(
    graphql`
      fragment TeamPromptMobileAvatars_meeting on NewMeeting {
        meetingMembers {
          id
          userId
          isConnectedAt
          user {
            ...NewMeetingAvatar_user
            ...MeetingOverflowMenu_users
          }
        }
      }
    `,
    meetingRef
  )
  const {viewerId} = useAtmosphere()
  const connectedMembers = meeting.meetingMembers
    .filter((member) => member.isConnectedAt || member.userId === viewerId)
    .sort((a, b) => (a.userId === viewerId ? -1 : a.isConnectedAt! < b.isConnectedAt! ? -1 : 1))
  const visibleMembers = connectedMembers.slice(0, MAX_AVATARS)
  const hiddenMembers = connectedMembers.slice(MAX_AVATARS)
  return (
    <div className='flex shrink-0 items-center'>
      {visibleMembers.map((member) => (
        <div key={member.id} className={slotClassName}>
          <NewMeetingAvatar userRef={member.user} />
        </div>
      ))}
      {hiddenMembers.length > 0 && (
        <div className={slotClassName}>
          <MeetingOverflowMenu hiddenMembers={hiddenMembers.map((member) => member.user)} />
        </div>
      )}
    </div>
  )
}

export default TeamPromptMobileAvatars

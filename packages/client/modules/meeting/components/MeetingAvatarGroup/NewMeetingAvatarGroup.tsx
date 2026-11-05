import graphql from 'babel-plugin-relay/macro'
import {AnimatePresence, motion} from 'motion/react'
import {forwardRef, useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {NewMeetingAvatarGroup_meeting$key} from '../../../../__generated__/NewMeetingAvatarGroup_meeting.graphql'
import AddTeamMemberAvatarButton from '../../../../components/AddTeamMemberAvatarButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import useThrottledValue from '../../../../hooks/useThrottledValue'
import {cn} from '../../../../ui/cn'
import {isNotNull} from '../../../../utils/predicates'
import MeetingOverflowMenu from './MeetingOverflowMenu'
import NewMeetingAvatar from './NewMeetingAvatar'

const MOTION_TRANSITION = {duration: 0.3, ease: [0, 0, 0.2, 1]} as const
// Longer than an avatar's entrance, so a burst of arrivals and departures never cuts one short
const PRESENCE_THROTTLE_MS = 500
const MAX_VISIBLE_AVATARS = 8
// More than this wraps the row under the phase title on a phone
const MAX_VISIBLE_AVATARS_ON_PHONE = 4

const overlappingBlockCls = 'relative -ml-3 rounded-full bg-surface-app p-[1px] first:ml-0'

const AvatarSlot = forwardRef<HTMLDivElement, {children: React.ReactNode}>(({children}, ref) => (
  <motion.div
    ref={ref}
    className={overlappingBlockCls}
    layout
    initial={{opacity: 0, scale: 1}}
    animate={{opacity: 1, scale: 1}}
    exit={{opacity: 0, scale: 0.5, width: 0, transition: {duration: 0.15, ease: 'easeOut'}}}
    transition={MOTION_TRANSITION}
  >
    {children}
  </motion.div>
))

interface Props {
  meetingRef: NewMeetingAvatarGroup_meeting$key
}

const NewMeetingAvatarGroup = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {meetingRef} = props
  const isWiderThanPhone = useBreakpoint(600)
  const maxVisibleAvatars = isWiderThanPhone ? MAX_VISIBLE_AVATARS : MAX_VISIBLE_AVATARS_ON_PHONE

  const meeting = useFragment(
    graphql`
      fragment NewMeetingAvatarGroup_meeting on NewMeeting {
        id
        team {
          id
          teamMembers {
            id
            ...AddTeamMemberAvatarButton_teamMembers
          }
        }
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

  const {id: meetingId, team, meetingMembers} = meeting
  const {id: teamId, teamMembers} = team

  const connectedMeetingMemberIds = useMemo(() => {
    return meetingMembers
      .filter((meetingMember) => meetingMember.isConnectedAt || meetingMember.userId === viewerId)
      .sort((a, b) => (a.userId === viewerId ? -1 : a.isConnectedAt! < b.isConnectedAt! ? -1 : 1))
      .map(({id}) => id)
      .join(',')
  }, [meetingMembers, viewerId])
  const shownMeetingMemberIds = useThrottledValue(connectedMeetingMemberIds, PRESENCE_THROTTLE_MS)
  const connectedMeetingMembers = useMemo(() => {
    const meetingMembersById = new Map(
      meetingMembers.map((meetingMember) => [meetingMember.id, meetingMember])
    )
    return shownMeetingMemberIds
      .split(',')
      .map((id) => meetingMembersById.get(id))
      .filter(isNotNull)
  }, [meetingMembers, shownMeetingMemberIds])

  // Never show a "+1": the one person it would hide fits in its place
  const visibleCount =
    connectedMeetingMembers.length > maxVisibleAvatars + 1
      ? maxVisibleAvatars
      : connectedMeetingMembers.length
  const visibleConnectedMeetingMembers = connectedMeetingMembers.slice(0, visibleCount)
  const hiddenMeetingMembers = connectedMeetingMembers.slice(visibleCount)

  return (
    <div className='relative flex flex-1 flex-row items-center justify-center text-center'>
      <AnimatePresence initial={false} mode='popLayout'>
        {visibleConnectedMeetingMembers.map((meetingMember) => (
          <AvatarSlot key={meetingMember.id}>
            <NewMeetingAvatar userRef={meetingMember.user} />
          </AvatarSlot>
        ))}
        {hiddenMeetingMembers.length > 0 && (
          <AvatarSlot key='overflow'>
            <MeetingOverflowMenu hiddenMembers={hiddenMeetingMembers.map((m) => m.user)} />
          </AvatarSlot>
        )}
      </AnimatePresence>
      {/* keeps the +N count uncovered */}
      <div className={cn(overlappingBlockCls, hiddenMeetingMembers.length > 0 && 'ml-1')}>
        <AddTeamMemberAvatarButton
          meetingId={meetingId}
          teamId={teamId}
          teamMembers={teamMembers}
        />
      </div>
    </div>
  )
}

export default NewMeetingAvatarGroup

import graphql from 'babel-plugin-relay/macro'
import {AnimatePresence, motion} from 'motion/react'
import {forwardRef, useMemo, useRef} from 'react'
import {useFragment} from 'react-relay'
import type {NewMeetingAvatarGroup_meeting$key} from '../../../../__generated__/NewMeetingAvatarGroup_meeting.graphql'
import AddTeamMemberAvatarButton from '../../../../components/AddTeamMemberAvatarButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import MeetingOverflowMenu from './MeetingOverflowMenu'
import NewMeetingAvatar from './NewMeetingAvatar'
import {useAvatarOverflowThreshold} from './useAvatarOverflowThreshold'

const MOTION_TRANSITION = {duration: 0.3, ease: [0, 0, 0.2, 1]} as const

const overlappingBlockCls = 'relative -ml-2 rounded-full bg-slate-200 p-[3px] first:ml-0 xl:-ml-3.5'

const AvatarSlot = forwardRef<HTMLDivElement, {children: React.ReactNode}>(({children}, ref) => (
  <motion.div
    ref={ref}
    className={overlappingBlockCls}
    layout
    initial={{opacity: 0, scale: 1}}
    animate={{opacity: 1, scale: 1}}
    exit={{opacity: 0, scale: 0.5, width: 0}}
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
  const containerRef = useRef<HTMLDivElement>(null)
  const overflowThreshold = useAvatarOverflowThreshold(containerRef)

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

  const connectedMeetingMembers = useMemo(() => {
    return meetingMembers
      .filter((meetingMember) => meetingMember.isConnectedAt || meetingMember.userId === viewerId)
      .sort((a, b) => (a.userId === viewerId ? -1 : a.isConnectedAt! < b.isConnectedAt! ? -1 : 1))
  }, [meetingMembers, viewerId])

  const rawHidden = connectedMeetingMembers.slice(overflowThreshold)
  // Never show a "+1" — if only one would be hidden, just show it
  const visibleConnectedMeetingMembers =
    rawHidden.length === 1
      ? connectedMeetingMembers
      : connectedMeetingMembers.slice(0, overflowThreshold)
  const hiddenMeetingMembers = rawHidden.length === 1 ? [] : rawHidden

  return (
    <div
      ref={containerRef}
      className='relative flex flex-1 flex-row items-center justify-center text-center'
    >
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
      <div className={overlappingBlockCls}>
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

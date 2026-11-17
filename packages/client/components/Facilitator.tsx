import graphql from 'babel-plugin-relay/macro'
import {Suspense, useState} from 'react'
import {useFragment} from 'react-relay'
import type {Facilitator_meeting$key} from '~/__generated__/Facilitator_meeting.graphql'
import {MoreVert} from '~/ui/icons'
import useAtmosphere from '../hooks/useAtmosphere'
import {cn} from '../ui/cn'
import {Menu} from '../ui/Menu/Menu'
import isDemoRoute from '../utils/isDemoRoute'
import lazyPreload from '../utils/lazyPreload'

interface Props {
  meetingRef: Facilitator_meeting$key
}

const FacilitatorMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'FacilitatorMenu' */
      './FacilitatorMenu'
    )
)

const Facilitator = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment Facilitator_meeting on NewMeeting {
        ...FacilitatorMenu_meeting
        endedAt
        facilitatorUserId
        meetingMembers {
          isConnectedAt
          userId
        }
        facilitator {
          user {
            picture
            preferredName
          }
        }
      }
    `,
    meetingRef
  )
  const {endedAt, facilitatorUserId, meetingMembers, facilitator} = meeting
  const connectedMemberIds = meetingMembers.filter((mm) => mm.isConnectedAt).map((mm) => mm.userId)
  const facilitatingMeetingMember = meetingMembers.find((mm) => mm.userId === facilitatorUserId)
  const {user} = facilitator
  const {picture = '', preferredName = ''} = user ?? {}
  const [isOpen, setIsOpen] = useState(false)
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isReadOnly =
    isDemoRoute() ||
    (viewerId === facilitatorUserId &&
      connectedMemberIds.length === 1 &&
      connectedMemberIds[0] === viewerId) ||
    !!endedAt
  const isConnected = !!facilitatingMeetingMember?.isConnectedAt
  const handleOnMouseEnter = () => !isReadOnly && FacilitatorMenu.preload()
  const trigger = (
    <div
      className={cn(
        'group/facilitator flex items-center px-1 py-[2px]',
        !isReadOnly && 'cursor-pointer'
      )}
      onMouseEnter={handleOnMouseEnter}
    >
      <div
        className={cn(
          'mr-[13px] ml-px h-[30px] w-[30px] shrink-0 rounded-[30px] border-2',
          isConnected ? 'border-jade-400' : 'border-fg-muted'
        )}
      >
        <img
          className='h-[26px] w-[26px] rounded-[26px] border border-white'
          alt=''
          src={picture}
        />
      </div>
      <div>
        <div className='font-semibold text-fg-primary text-sm'>Facilitator</div>
        <div className='w-[165px] break-words font-normal text-[13px] text-fg-secondary leading-4'>
          {viewerId === facilitatorUserId ? 'You' : preferredName}
        </div>
      </div>
      {!isReadOnly && (
        <span
          className={cn(
            'ml-auto flex size-7 shrink-0 items-center justify-center rounded-md text-fg-secondary group-hover/facilitator:bg-surface-phase-active group-hover/facilitator:text-fg-primary',
            isOpen && 'bg-surface-phase-active text-fg-primary'
          )}
        >
          <MoreVert className='text-lg' />
        </span>
      )}
    </div>
  )

  return (
    <div className='mb-2 border-hairline border-b px-2 pb-2 font-bold'>
      {isReadOnly ? (
        trigger
      ) : (
        <Menu open={isOpen} onOpenChange={setIsOpen} trigger={trigger}>
          <Suspense fallback={null}>
            <FacilitatorMenu meeting={meeting} onClose={() => setIsOpen(false)} />
          </Suspense>
        </Menu>
      )}
    </div>
  )
}

export default Facilitator

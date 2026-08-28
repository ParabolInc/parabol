import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {Facilitator_meeting$key} from '~/__generated__/Facilitator_meeting.graphql'
import {MoreVert} from '~/ui/icons'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PortalStatus} from '../hooks/usePortal'
import {cn} from '../ui/cn'
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
  const {togglePortal, menuProps, menuPortal, originRef, portalStatus} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT,
    {
      isDropdown: true
    }
  )
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isReadOnly =
    isDemoRoute() ||
    (viewerId === facilitatorUserId &&
      connectedMemberIds.length === 1 &&
      connectedMemberIds[0] === viewerId) ||
    !!endedAt
  const isActive = portalStatus === PortalStatus.Entering || portalStatus === PortalStatus.Entered
  const isConnected = !!facilitatingMeetingMember?.isConnectedAt
  const handleOnMouseEnter = () => !isReadOnly && FacilitatorMenu.preload()
  const handleOnClick = () => !isReadOnly && togglePortal()
  return (
    <div className='mb-2 border-hairline border-b px-2 pb-2 font-bold'>
      <div
        className={cn(
          'group/facilitator flex items-center px-1 py-[2px]',
          !isReadOnly && 'cursor-pointer'
        )}
        onClick={handleOnClick}
        onMouseEnter={handleOnMouseEnter}
        ref={originRef}
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
              'ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-md group-hover/facilitator:bg-surface-phase-active group-hover/facilitator:text-fg-primary',
              isActive ? 'bg-surface-phase-active text-fg-primary' : 'text-fg-secondary'
            )}
          >
            <MoreVert />
          </span>
        )}
      </div>
      {menuPortal(<FacilitatorMenu menuProps={menuProps} meeting={meeting} />)}
    </div>
  )
}

export default Facilitator

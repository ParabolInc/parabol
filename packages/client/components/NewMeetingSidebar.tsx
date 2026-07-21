import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import type {NewMeetingSidebar_meeting$key} from '~/__generated__/NewMeetingSidebar_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {useRenameMeeting} from '~/hooks/useRenameMeeting'
import useBreakpoint from '../hooks/useBreakpoint'
import {Breakpoint} from '../types/constEnums'
import {cn} from '../ui/cn'
import isDemoRoute from '../utils/isDemoRoute'
import EditableText from './EditableText'
import Facilitator from './Facilitator'
import LogoBlock from './LogoBlock/LogoBlock'
import NewMeetingSidebarUpgradeBlock from './NewMeetingSidebarUpgradeBlock'
import MeetingDateLabel from './Recurrence/MeetingDateLabel'
import SidebarToggle from './SidebarToggle'
import InactiveTag from './Tag/InactiveTag'

const isGlobalBannerEnabled = window.__ACTION__.GLOBAL_BANNER_ENABLED
// GlobalBanner.HEIGHT === 24px
const sidebarHeightCls = isGlobalBannerEnabled ? 'h-[calc(100vh-24px)]' : 'h-screen'
const sidebarPaddingTopCls = isGlobalBannerEnabled ? 'pt-6' : 'pt-0'

const meetingNameCls = 'wrap-break-word font-semibold text-xl leading-6'

interface Props {
  children: ReactNode
  handleMenuClick: () => void
  toggleSidebar: () => void
  meeting: NewMeetingSidebar_meeting$key
}

const NewMeetingSidebar = (props: Props) => {
  const {children, handleMenuClick, toggleSidebar, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment NewMeetingSidebar_meeting on NewMeeting {
        ...Facilitator_meeting
        ...MeetingDateLabel_meeting
        id
        endedAt
        facilitatorUserId
        name
        team {
          id
          name
          organization {
            id
            tierLimitExceededAt
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, endedAt, team, name: meetingName, facilitatorUserId} = meeting
  const {id: teamId, name: teamName, organization} = team
  const {id: orgId, tierLimitExceededAt} = organization
  const teamLink = isDemoRoute() ? '/create-account' : `/team/${teamId}`
  const {handleSubmit, validate, error} = useRenameMeeting(meetingId)
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isFacilitator = viewerId === facilitatorUserId
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  return (
    <div
      data-cy='sidebar'
      className={cn(
        // NavSidebar.WIDTH === 256px
        'flex min-w-64 max-w-64 flex-1 select-none flex-col bg-surface-meeting-sidebar',
        isDesktop ? cn(sidebarHeightCls, 'pt-0') : cn('h-screen', sidebarPaddingTopCls)
      )}
    >
      <div className='relative mb-2 flex items-start border-hairline border-b p-4 pr-2'>
        <SidebarToggle className='pr-4' dataCy={`sidebar`} onClick={toggleSidebar} />
        <div className='min-w-0 flex-1'>
          {isFacilitator ? (
            <EditableText
              className={meetingNameCls}
              error={error?.message}
              handleSubmit={handleSubmit}
              initialValue={meetingName || ''}
              isWrap
              maxLength={50}
              validate={validate}
              placeholder={'Best Meeting Ever!'}
            />
          ) : (
            <div className={meetingNameCls}>{meetingName}</div>
          )}
          <MeetingDateLabel meetingRef={meeting} />
          <Link
            to={teamLink}
            className='wrap-break-word mt-1 block font-normal text-[13px] text-accent leading-4 hover:cursor-pointer hover:text-accent'
          >
            {'Team: '}
            {teamName}
          </Link>
          {endedAt && <InactiveTag className='m-0 mt-1 inline-flex'>Meeting Completed</InactiveTag>}
        </div>
      </div>
      <Facilitator meetingRef={meeting} />
      {children}
      {tierLimitExceededAt && (
        <NewMeetingSidebarUpgradeBlock
          onClick={handleMenuClick}
          orgId={orgId}
          meetingId={meetingId}
        />
      )}
      <LogoBlock onClick={handleMenuClick} />
    </div>
  )
}

export default NewMeetingSidebar

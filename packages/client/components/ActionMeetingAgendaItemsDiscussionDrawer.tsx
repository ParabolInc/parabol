import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ActionMeetingAgendaItemsDiscussionDrawer_meeting$key} from '~/__generated__/ActionMeetingAgendaItemsDiscussionDrawer_meeting.graphql'
import {desktopSidebarShadow} from '~/styles/elevation'
import {BezierCurve, GlobalBanner, ZIndex} from '../types/constEnums'
import type {DiscussionThreadables} from './DiscussionThreadList'
import DiscussionThreadListEmptyState from './DiscussionThreadListEmptyState'
import DiscussionThreadRoot from './DiscussionThreadRoot'
import PlainButton from './PlainButton/PlainButton'

const isGlobalBannerEnabled = window.__ACTION__.GLOBAL_BANNER_ENABLED

interface Props {
  isOpen: boolean
  meeting: ActionMeetingAgendaItemsDiscussionDrawer_meeting$key
  onToggle: () => void
}

const ActionMeetingAgendaItemsDiscussionDrawer = (props: Props) => {
  const {isOpen, meeting: meetingRef, onToggle} = props
  const meeting = useFragment(
    graphql`
      fragment ActionMeetingAgendaItemsDiscussionDrawer_meeting on ActionMeeting {
        endedAt
        localStage {
          ...ActionMeetingAgendaItemsDiscussionDrawerAgendaItemsStage @relay(mask: false)
        }
        phases {
          stages {
            ...ActionMeetingAgendaItemsDiscussionDrawerAgendaItemsStage @relay(mask: false)
          }
        }
      }
    `,
    meetingRef
  )
  const {endedAt, localStage} = meeting
  const {discussionId} = localStage
  const allowedThreadables: DiscussionThreadables[] = endedAt ? [] : ['comment', 'task', 'poll']
  const isReadOnly = allowedThreadables.length === 0

  const drawerStyle: React.CSSProperties = {
    boxShadow: desktopSidebarShadow,
    paddingTop: isGlobalBannerEnabled ? GlobalBanner.HEIGHT : 0,
    transition: `all 200ms ${BezierCurve.DECELERATE}`,
    zIndex: ZIndex.SIDEBAR
  }

  return (
    <div
      className={`static single-reflection-column:fixed single-reflection-column:top-0 single-reflection-column:right-0 single-reflection-column:bottom-0 flex h-screen w-[360px] select-none flex-col justify-start overflow-hidden bg-white ${isOpen ? 'single-reflection-column:w-[360px]' : 'single-reflection-column:w-0'}`}
      style={drawerStyle}
    >
      {/* Header */}
      <div className='flex w-full items-center justify-between border-slate-300 border-b px-3 py-2'>
        <span className='font-semibold text-slate-700 text-xs uppercase tracking-wider'>
          {'Discussion & Takeaway Tasks'}
        </span>
        <PlainButton onClick={onToggle} className='h-6 shrink-0 px-2'>
          <Close className='cursor-pointer text-slate-600 hover:opacity-50' />
        </PlainButton>
      </div>

      {/* Thread content */}
      <div className='relative bottom-0 flex h-full w-full max-w-[700px] flex-1 flex-col items-center justify-end overflow-auto'>
        <DiscussionThreadRoot
          allowedThreadables={allowedThreadables}
          discussionId={discussionId!}
          width='100%'
          emptyState={<DiscussionThreadListEmptyState allowTasks={true} isReadOnly={isReadOnly} />}
        />
      </div>
    </div>
  )
}

graphql`
  fragment ActionMeetingAgendaItemsDiscussionDrawerAgendaItemsStage on NewMeetingStage {
    ... on AgendaItemsStage {
      discussionId
    }
  }
`

export default ActionMeetingAgendaItemsDiscussionDrawer

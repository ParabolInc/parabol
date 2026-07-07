import {Forum, Transcribe} from '@mui/icons-material'
import type {ComponentPropsWithoutRef, ReactElement, ReactNode} from 'react'
import {cn} from '../ui/cn'
import hasToken from '../utils/hasToken'
import isDemoRoute from '../utils/isDemoRoute'
import DemoCreateAccountButton from './DemoCreateAccountButton'
import IconLabel from './IconLabel'
import RetroDrawerRoot from './RetroDrawerRoot'
import SidebarToggle from './SidebarToggle'

// The two custom breakpoints below match the deprecated meetingAvatarMediaQueries (1280px & 1600px).
export const MeetingTopBarStyles = ({className, ...props}: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={cn(
      // pr compensates for overlapping block padding
      'flex w-full max-w-full shrink-0 flex-wrap items-start justify-between overflow-x-auto pr-3.5 pl-4 min-[1280px]:pr-3.25',
      className
    )}
    {...props}
  />
)

export const IconGroupBlock = ({className, ...props}: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={cn(
      'flex items-center justify-center py-2.5 min-[1280px]:min-h-19 min-[1280px]:py-0',
      className
    )}
    {...props}
  />
)

interface Props {
  avatarGroup: ReactElement
  children?: ReactNode
  isCommentUnread?: boolean
  isMeetingSidebarCollapsed: boolean
  rightDrawerOpen?: string | null
  // The tab the drawer button opens to, which sets its icon & label. Defaults to 'discussion'.
  drawerType?: 'discussion' | 'inspiration' | 'transcription'
  toggleSidebar: () => void
  toggleDrawer?: () => void
  meetingId?: string
}

const MeetingTopBar = (props: Props) => {
  const {
    avatarGroup,
    children,
    isCommentUnread = false,
    isMeetingSidebarCollapsed,
    rightDrawerOpen,
    drawerType = 'discussion',
    toggleDrawer,
    toggleSidebar,
    meetingId
  } = props
  const showButton = isDemoRoute() && !hasToken()
  const showDrawerButton = toggleDrawer && rightDrawerOpen == null
  const isOptionsVisible = !!meetingId && !isDemoRoute()
  const drawerButton =
    drawerType === 'inspiration'
      ? {icon: 'task_alt' as const, label: 'Inspiration'}
      : drawerType === 'transcription'
        ? {icon: Transcribe, label: 'Transcription'}
        : {icon: Forum, label: 'Discussion'}

  return (
    <MeetingTopBarStyles>
      <div
        className={cn(
          'mt-4 flex min-h-6 items-start min-[600px]:flex-1',
          !isMeetingSidebarCollapsed && 'pl-2'
        )}
      >
        {isMeetingSidebarCollapsed && (
          <SidebarToggle className='mr-4' dataCy='topbar' onClick={toggleSidebar} />
        )}
        <div className='w-full'>{children}</div>
      </div>
      <IconGroupBlock>
        {showButton && (
          <div className='flex items-center'>
            <DemoCreateAccountButton />
          </div>
        )}
        {avatarGroup}
        {showDrawerButton && toggleDrawer && (
          <div className='relative ml-2.75 flex content-center items-center min-[1280px]:ml-2.5'>
            <div className='-top-px -right-px absolute z-1 h-2.5 w-2.5 min-[1280px]:top-2 min-[1600px]:top-0.75 min-[1280px]:right-2 min-[1600px]:right-0.75'>
              <div
                className={cn(
                  'h-2.5 w-2.5 rounded-full border border-white/65 bg-tomato-500',
                  isCommentUnread ? 'flex' : 'hidden'
                )}
              />
            </div>
            <button
              className='group flex h-max w-max cursor-pointer flex-col items-center bg-transparent px-2 font-semibold text-sky-500 text-sm hover:text-sky-600'
              onClick={toggleDrawer}
            >
              <IconLabel icon={drawerButton.icon} iconLarge />
              <div className='text-slate-700 group-hover:text-slate-900'>{drawerButton.label}</div>
            </button>
          </div>
        )}
        {isOptionsVisible && <RetroDrawerRoot meetingId={meetingId} />}
      </IconGroupBlock>
    </MeetingTopBarStyles>
  )
}
export default MeetingTopBar

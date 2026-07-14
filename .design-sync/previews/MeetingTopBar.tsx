import {MeetingTopBar, PhaseHeaderTitle} from 'parabol-client'

const AvatarGroup = () => (
  <div className='flex -space-x-2'>
    <div className='flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-grape-500 text-white text-xs'>
      JH
    </div>
    <div className='flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-aqua-400 text-white text-xs'>
      MR
    </div>
    <div className='flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-tomato-500 text-white text-xs'>
      AL
    </div>
  </div>
)

export const Default = () => (
  <div className='w-full bg-white'>
    <MeetingTopBar
      isMeetingSidebarCollapsed={false}
      toggleSidebar={() => {}}
      avatarGroup={<AvatarGroup />}
    >
      <PhaseHeaderTitle>Reflect</PhaseHeaderTitle>
    </MeetingTopBar>
  </div>
)

export const SidebarCollapsed = () => (
  <div className='w-full bg-white'>
    <MeetingTopBar
      isMeetingSidebarCollapsed
      toggleSidebar={() => {}}
      avatarGroup={<AvatarGroup />}
    >
      <PhaseHeaderTitle>Group</PhaseHeaderTitle>
    </MeetingTopBar>
  </div>
)

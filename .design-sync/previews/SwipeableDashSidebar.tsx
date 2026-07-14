import ArticleIcon from '@mui/icons-material/Article'
import DashboardIcon from '@mui/icons-material/Dashboard'
import GroupsIcon from '@mui/icons-material/Groups'
import {SwipeableDashSidebar} from 'parabol-client'

const NavRow = ({label, Icon}: {label: string; Icon: typeof DashboardIcon}) => (
  <div className='flex items-center gap-2 rounded-md px-2 py-1 text-slate-700 text-sm hover:bg-slate-300'>
    <Icon className='size-5 text-slate-600' />
    <span>{label}</span>
  </div>
)

export const Open = () => (
  <div className='relative h-96'>
    <SwipeableDashSidebar isOpen={true} onToggle={() => {}}>
      <div className='flex h-full w-64 flex-col gap-1 bg-slate-200 p-3'>
        <div className='px-2 pb-2 font-semibold text-slate-700'>Parabol</div>
        <NavRow label='Meetings' Icon={DashboardIcon} />
        <NavRow label='Teams' Icon={GroupsIcon} />
        <NavRow label='Pages' Icon={ArticleIcon} />
      </div>
    </SwipeableDashSidebar>
  </div>
)

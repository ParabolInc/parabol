import DashboardIcon from '@mui/icons-material/Dashboard'
import GroupsIcon from '@mui/icons-material/Groups'
import {LeftDashNavItem} from 'parabol-client'
import {MemoryRouter} from 'react-router'

export const Meetings = () => (
  <MemoryRouter initialEntries={['/meetings']}>
    <div className='w-56 bg-slate-200 p-1'>
      <LeftDashNavItem label='Meetings' href='/meetings' Icon={DashboardIcon} />
    </div>
  </MemoryRouter>
)

export const Teams = () => (
  <MemoryRouter initialEntries={['/meetings']}>
    <div className='w-56 bg-slate-200 p-1'>
      <LeftDashNavItem label='Teams' href='/me/teams' Icon={GroupsIcon} />
    </div>
  </MemoryRouter>
)

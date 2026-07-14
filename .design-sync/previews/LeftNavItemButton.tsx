import MoreVertIcon from '@mui/icons-material/MoreVert'
import {LeftNavItem, LeftNavItemButton} from 'parabol-client'

export const PageActions = () => (
  <div className='group flex w-56 items-center rounded-md bg-slate-300 px-2 py-1'>
    <LeftNavItem>
      <span className='text-slate-700'>Product Roadmap</span>
    </LeftNavItem>
    <LeftNavItemButton Icon={MoreVertIcon} tooltip='Page options' onClick={() => {}} />
  </div>
)

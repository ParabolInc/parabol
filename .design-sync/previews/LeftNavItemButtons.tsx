import AddIcon from '@mui/icons-material/Add'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {LeftNavItem, LeftNavItemButton, LeftNavItemButtons} from 'parabol-client'

export const HoverActions = () => (
  <div className='group flex w-56 items-center rounded-md bg-slate-300 px-2 py-1'>
    <LeftNavItem>
      <span className='text-slate-700'>Product Roadmap</span>
    </LeftNavItem>
    <LeftNavItemButtons>
      <LeftNavItemButton Icon={AddIcon} tooltip='Add child page' onClick={() => {}} />
      <LeftNavItemButton Icon={MoreVertIcon} tooltip='Page options' onClick={() => {}} />
    </LeftNavItemButtons>
  </div>
)

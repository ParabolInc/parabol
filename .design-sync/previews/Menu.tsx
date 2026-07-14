import {Menu, MenuContent, MenuItem} from 'parabol-client'

const Trigger = (
  <button className='inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 text-sm shadow-sm'>
    Board actions
  </button>
)

export const BoardActions = () => (
  <div className='pb-40'>
    <Menu defaultOpen trigger={Trigger}>
      <MenuContent align='start' sideOffset={4}>
        <MenuItem>Rename board</MenuItem>
        <MenuItem>Duplicate board</MenuItem>
        <MenuItem>Export to CSV</MenuItem>
        <MenuItem isDisabled>Archive board</MenuItem>
      </MenuContent>
    </Menu>
  </div>
)

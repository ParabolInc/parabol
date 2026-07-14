import {Menu, MenuContent, MenuItemCheckbox} from 'parabol-client'

const Trigger = (
  <button className='inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 text-sm shadow-sm'>
    View options
  </button>
)

export const Composed = () => (
  <div className='pb-40'>
    <Menu defaultOpen trigger={Trigger}>
      <MenuContent align='start' sideOffset={4}>
        <MenuItemCheckbox checked>Show completed tasks</MenuItemCheckbox>
        <MenuItemCheckbox checked>Group by assignee</MenuItemCheckbox>
        <MenuItemCheckbox checked={false}>Show archived boards</MenuItemCheckbox>
      </MenuContent>
    </Menu>
  </div>
)

import {MoreVert} from 'parabol-client/ui/icons'
import {Menu} from 'parabol-client/ui/Menu/Menu'
import {MenuContent} from 'parabol-client/ui/Menu/MenuContent'
import {MenuItem} from 'parabol-client/ui/Menu/MenuItem'

type MenuOption = {
  label: string
  onClick: () => void
}

type Props = {
  options: MenuOption[]
}

const MoreMenu = ({options}: Props) => {
  return (
    <Menu
      trigger={
        <button
          aria-label='more'
          className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent hover:bg-surface-hover'
        >
          <MoreVert className='text-[2.4rem]' />
        </button>
      }
    >
      <MenuContent align='end'>
        {options.map(({label, onClick}) => (
          <MenuItem className='text-[1.5rem]' key={label} onClick={onClick}>
            {label}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  )
}

export default MoreMenu

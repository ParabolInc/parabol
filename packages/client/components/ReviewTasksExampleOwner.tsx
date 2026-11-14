import avatarUser from '../styles/theme/images/avatar-user.svg'
import {ArrowDropDown} from '../ui/icons'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import menuSectionTitleClass from '../ui/Menu/menuSectionTitleClass'

export interface ExampleOwner {
  readonly userId: string
  readonly preferredName: string
  readonly picture: string
}

interface Props {
  owner: ExampleOwner | undefined
  teamMembers: readonly ExampleOwner[]
  onOwner: (userId: string) => void
}

const ReviewTasksExampleOwner = (props: Props) => {
  const {owner, teamMembers, onOwner} = props
  return (
    <Menu
      trigger={
        <button
          type='button'
          aria-label='Assign this example card to a teammate'
          className='-ml-1 flex h-6 min-w-0 items-center rounded-sm pr-0.5 pl-1 hover:bg-surface-hover focus-visible:bg-surface-hover data-[state=open]:bg-surface-hover'
        >
          <img className='mr-1.5 h-6 w-6 rounded-full' alt='' src={owner?.picture || avatarUser} />
          <span className='truncate font-semibold text-fg-secondary text-xs leading-6'>
            {owner?.preferredName ?? 'Unassigned'}
          </span>
          <ArrowDropDown className='h-4 w-4 flex-none text-fg-secondary' />
        </button>
      }
    >
      <MenuContent align='start' className='max-h-72 w-[220px]'>
        <div className={menuSectionTitleClass}>Assign to</div>
        {teamMembers.map(({userId, preferredName, picture}) => (
          <MenuItem key={userId} onSelect={() => onOwner(userId)}>
            <img className='mr-2 h-6 w-6 rounded-full' alt='' src={picture || avatarUser} />
            <span className='truncate'>{preferredName}</span>
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  )
}

export default ReviewTasksExampleOwner

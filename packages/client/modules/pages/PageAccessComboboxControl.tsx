import {Menu} from '~/ui/Menu/Menu'
import {MenuContent} from '~/ui/Menu/MenuContent'
import {MenuItem} from '~/ui/Menu/MenuItem'
import {MenuLabelTrigger} from '~/ui/Menu/MenuLabelTrigger'
import type {PageRoleEnum} from '../../__generated__/useUpdatePageAccessMutation.graphql'

interface Props {
  canRemove?: boolean
  defaultRole: PageRoleEnum
  onClick: (role: PageRoleEnum | null) => void
}

const pageRoles = [
  {
    value: 'owner',
    label: 'Full access',
    description: 'Share, edit, and comment'
  },
  {
    value: 'editor',
    label: 'Can edit',
    description: 'Edit and comment'
  },
  {
    value: 'commenter',
    label: 'Can comment'
  },
  {
    value: 'viewer',
    label: 'Can view'
  }
] as {value: PageRoleEnum; label: string; description?: string}[]

export const PageAccessComboboxControl = (props: Props) => {
  const {onClick, defaultRole, canRemove} = props
  const roleLabel = pageRoles.find((role) => role.value === defaultRole)!.label
  return (
    <Menu
      trigger={<MenuLabelTrigger labelClassName={'pr-0'}>{roleLabel}</MenuLabelTrigger>}
      className='group'
    >
      <MenuContent align='end' sideOffset={4} className='max-h-80'>
        {pageRoles.map(({value, label, description}) => {
          return (
            <MenuItem
              key={value}
              onClick={() => {
                onClick(value)
              }}
            >
              <div className='flex flex-col'>
                <div>{label}</div>
                <div>{description}</div>
              </div>
            </MenuItem>
          )
        })}
        {canRemove && (
          <>
            <hr className={'my-1 h-0.25 bg-slate-500'}></hr>
            <MenuItem
              className={'hover:text-tomato-700'}
              key={'remove'}
              onClick={() => {
                onClick(null)
              }}
            >
              <div className='flex flex-col font-bold'>
                <div>{'Remove'}</div>
              </div>
            </MenuItem>
          </>
        )}
      </MenuContent>
    </Menu>
  )
}

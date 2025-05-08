import {Menu} from '~/ui/Menu/Menu'
import {MenuContent} from '~/ui/Menu/MenuContent'
import {MenuItem} from '~/ui/Menu/MenuItem'
import {MenuLabelTrigger} from '~/ui/Menu/MenuLabelTrigger'
import type {PageRoleEnum} from '../../__generated__/useUpdatePageAccessMutation.graphql'

interface Props {
  defaultRole: PageRoleEnum
  onClick: (role: PageRoleEnum) => void
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
  const {onClick, defaultRole} = props
  const roleLabel = pageRoles.find((role) => role.value === defaultRole)!.label
  return (
    <Menu
      trigger={<MenuLabelTrigger labelClassName={'pr-0'}>{roleLabel}</MenuLabelTrigger>}
      className='group'
    >
      <MenuContent align='end' sideOffset={4}>
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
      </MenuContent>
    </Menu>
  )
}

import type {
  PageRoleEnum,
  PageSubjectEnum
} from '../__generated__/useUpdatePageAccessMutation.graphql'
import {useUpdatePageAccessMutation} from '../mutations/useUpdatePageAccessMutation'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import {MenuLabelTrigger} from '../ui/Menu/MenuLabelTrigger'

interface Props {
  defaultRole: PageRoleEnum
  pageId: string
  subjectId: string
  subjectType: PageSubjectEnum
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

export const PageAccessCombobox = (props: Props) => {
  const {pageId, subjectId, subjectType, defaultRole} = props
  const [execute, submitting] = useUpdatePageAccessMutation()
  const toggleRole = (role: PageRoleEnum) => {
    if (submitting) return
    execute({
      variables: {
        pageId,
        role,
        subjectId,
        subjectType,
        unlinkApproved: false
      }
    })
  }

  return (
    <Menu trigger={<MenuLabelTrigger>{defaultRole}</MenuLabelTrigger>}>
      <MenuContent align='end' sideOffset={4}>
        {pageRoles.map(({value, label, description}) => {
          return (
            <MenuItem
              key={value}
              onClick={() => {
                toggleRole(value)
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

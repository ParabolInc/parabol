import type {MouseEvent} from 'react'
import {MoreVert as MoreVertIcon} from '~/ui/icons'
import type {OAuthClientTypeEnum} from '../../../../__generated__/OAuthProviderList_organization.graphql'
import {Menu} from '../../../../ui/Menu/Menu'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import {MenuItem} from '../../../../ui/Menu/MenuItem'
import {CLIENT_TYPE_LABELS} from './OAuthClientTypeField'

interface Props {
  name: string
  clientType: OAuthClientTypeEnum
  updatedAt: string
  onEdit: () => void
  onDelete: () => void
}

const OAuthProviderRow = ({name, clientType, updatedAt, onEdit, onDelete}: Props) => {
  return (
    <tr
      className='cursor-pointer border-hairline border-b last:border-0 hover:bg-surface-hover'
      onClick={onEdit}
    >
      <td className='px-4 py-3 font-medium text-fg-primary'>{name}</td>
      <td className='px-4 py-3 text-fg-primary'>{CLIENT_TYPE_LABELS[clientType]}</td>
      <td className='whitespace-nowrap px-4 py-3 text-fg-primary'>
        {new Date(updatedAt).toLocaleDateString()}
      </td>
      <td className='px-4 py-3 text-right' onClick={(e: MouseEvent) => e.stopPropagation()}>
        <Menu
          trigger={
            <button className='flex size-8 cursor-pointer items-center justify-center rounded-lg p-1 text-fg-muted outline-none hover:bg-surface-hover hover:text-fg-secondary'>
              <MoreVertIcon className='size-5' />
            </button>
          }
        >
          <MenuContent align='end'>
            <MenuItem onClick={onEdit}>Edit application</MenuItem>
            <MenuItem onClick={onDelete} className='text-tomato-600'>
              Delete application
            </MenuItem>
          </MenuContent>
        </Menu>
      </td>
    </tr>
  )
}

export default OAuthProviderRow

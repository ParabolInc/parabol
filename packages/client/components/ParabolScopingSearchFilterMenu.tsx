import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import type {ParabolSearchQuery} from '~/types/clientSchema'
import {taskScopingStatusFilters} from '~/utils/constants'
import type {ParabolScopingSearchFilterMenu_meeting$key} from '../__generated__/ParabolScopingSearchFilterMenu_meeting.graphql'
import type {MenuProps} from '../hooks/useMenu'
import Checkbox from './Checkbox'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'

interface Props {
  menuProps: MenuProps
  meeting: ParabolScopingSearchFilterMenu_meeting$key
}

const ParabolScopingSearchFilterMenu = (props: Props) => {
  const {meeting: meetingRef, menuProps} = props
  const meeting = useFragment(
    graphql`
      fragment ParabolScopingSearchFilterMenu_meeting on PokerMeeting {
        id
        parabolSearchQuery {
          queryString
          statusFilters
        }
      }
    `,
    meetingRef
  )
  const {portalStatus, isDropdown} = menuProps
  const {parabolSearchQuery, id: meetingId} = meeting
  const {statusFilters} = parabolSearchQuery
  const atmosphere = useAtmosphere()
  return (
    <Menu
      keepParentFocus
      ariaLabel={'Define the Parabol search query'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
    >
      <DropdownMenuLabel className='border-b-0'>Filter by status:</DropdownMenuLabel>
      {taskScopingStatusFilters.map((status) => {
        const toggleStatusFilter = () => {
          commitLocalUpdate(atmosphere, (store) => {
            const meeting = store.get(meetingId)!
            const parabolSearchQuery =
              meeting.getLinkedRecord<ParabolSearchQuery>('parabolSearchQuery')
            const statusFiltersProxy = parabolSearchQuery.getValue('statusFilters')?.slice() ?? []
            const keyIdx = statusFiltersProxy.indexOf(status)
            keyIdx !== -1 ? statusFiltersProxy.splice(keyIdx, 1) : statusFiltersProxy.push(status)
            parabolSearchQuery.setValue(statusFiltersProxy, 'statusFilters')
          })
        }
        return (
          <MenuItem
            key={status}
            label={
              <MenuItemLabel>
                <Checkbox className='-ml-2 mr-2' active={statusFilters?.includes(status) ?? null} />
                {status}
              </MenuItemLabel>
            }
            onClick={toggleStatusFilter}
          />
        )
      })}
    </Menu>
  )
}

export default ParabolScopingSearchFilterMenu

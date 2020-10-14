import React from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {ParabolScopingSearchFilterMenu_meeting} from '../__generated__/ParabolScopingSearchFilterMenu_meeting.graphql'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'
import {taskScopingStatusFilters} from '~/utils/constants'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'
import Checkbox from './Checkbox'
import styled from '@emotion/styled'
import DropdownMenuLabel from './DropdownMenuLabel'
import useAtmosphere from '~/hooks/useAtmosphere'
import {ParabolSearchQuery} from '~/types/clientSchema'

const StyledCheckBox = styled(Checkbox)({
  marginLeft: -8,
  marginRight: 8
})

const FilterLabel = styled(DropdownMenuLabel)({
  borderBottom: 0
})

interface Props {
  menuProps: MenuProps
  meeting: ParabolScopingSearchFilterMenu_meeting
}

const ParabolScopingSearchFilterMenu = (props: Props) => {
  const {meeting, menuProps} = props
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
      <FilterLabel>Filter by status:</FilterLabel>
      {taskScopingStatusFilters.map(status => {
        const toggleStatusFilter = () => {
          commitLocalUpdate(atmosphere, (store) => {
            const meeting = store.get(meetingId)!
            const parabolSearchQuery = meeting.getLinkedRecord<ParabolSearchQuery>('parabolSearchQuery')
            const statusFiltersProxy = parabolSearchQuery.getValue('statusFilters').slice()
            const keyIdx = statusFiltersProxy.indexOf(status)
            keyIdx !== -1 ?
              statusFiltersProxy.splice(keyIdx, 1)
              :
              statusFiltersProxy.push(status)
            parabolSearchQuery.setValue(statusFiltersProxy, 'statusFilters')
          })
        }
        return (
          <MenuItem
            key={status}
            label={
              <MenuItemLabel>
                <StyledCheckBox
                  active={statusFilters?.includes(status) ?? null} 
                />
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

export default createFragmentContainer(ParabolScopingSearchFilterMenu, {
  meeting: graphql`
    fragment ParabolScopingSearchFilterMenu_meeting on PokerMeeting {
      id
      parabolSearchQuery {
        queryString
        statusFilters
      }
    }
  `
})

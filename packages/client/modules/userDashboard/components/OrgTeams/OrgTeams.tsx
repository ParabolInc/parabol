import React, {useState} from 'react'
import graphql from 'babel-plugin-relay/macro'
import useMenu, {MenuProps} from '../../../../hooks/useMenu'
import styled from '@emotion/styled'
import Row from '../../../../components/Row/Row'
import Panel from '../../../../components/Panel/Panel'
import {ElementWidth} from '../../../../types/constEnums'
import {useFragment} from 'react-relay'
import OrgTeamsRow from './OrgTeamsRow'
import SwitchLabels from '../../../../components/Switch/Switch'
import {OrgTeams_organization$key} from '../../../../__generated__/OrgTeams_organization.graphql'
import Menu from '../../../../components/Menu'
import {MenuPosition} from '../../../../hooks/useCoords'
import MenuItem from '../../../../components/MenuItem'
import DropdownMenuLabel from '../../../../components/DropdownMenuLabel'
import DashFilterToggle from '../../../../components/DashFilterToggle/DashFilterToggle'

const StyledPanel = styled(Panel)({
  maxWidth: ElementWidth.PANEL_WIDTH
})

type Props = {
  organizationRef: OrgTeams_organization$key
}

const OrgTeams = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgTeams_organization on Organization {
        id
        isBillingLeader
        teams {
          id
          ...OrgTeamsRow_team
        }
      }
    `,
    organizationRef
  )
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const [selectedItem, setSelectedItem] = useState('All Teams In Org')

  const handleMenuItemClick = (label: string) => {
    setSelectedItem(label)
    togglePortal()
  }

  const {teams, isBillingLeader} = organization
  if (!isBillingLeader) return null
  return (
    <>
      <h1>{'Teams'}</h1>
      <DashFilterToggle
        label='Team Member'
        onClick={togglePortal}
        // onMouseEnter={TeamDashTeamMemberMenu.preload}
        ref={originRef}
        value={selectedItem} // Use state variable here
      />
      {menuPortal(
        <Menu keepParentFocus ariaLabel={'Select the team to filter by'} {...menuProps}>
          <MenuItem
            label={'All Teams In Org'}
            onClick={() => handleMenuItemClick('All Teams In Org')}
          />
          <MenuItem
            label={'All Teams In Domain'}
            onClick={() => handleMenuItemClick('All Teams In Domain')}
          />
        </Menu>
      )}
      <StyledPanel>
        <Row>
          <div className='flex w-full justify-between px-4'>
            <div className='flex items-center font-bold'>Team Name</div>
            <div className='flex items-center font-bold'>Lead</div>
          </div>
        </Row>
        {teams.map((team) => (
          <OrgTeamsRow key={team.id} teamRef={team} />
        ))}
      </StyledPanel>
    </>
  )
}

export default OrgTeams

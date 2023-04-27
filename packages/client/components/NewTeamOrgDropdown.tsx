import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuProps} from '../hooks/useMenu'
import {NewTeamOrgDropdown_organizations$key} from '../__generated__/NewTeamOrgDropdown_organizations.graphql'
import DropdownMenuItemLabel from './DropdownMenuItemLabel'
import DropdownMenuLabel from './DropdownMenuLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import TierTag from './Tag/TierTag'

interface Props {
  menuProps: MenuProps
  defaultActiveIdx: number
  onChange: (orgId: string) => void
  organizations: NewTeamOrgDropdown_organizations$key
}

const NewTeamOrgDropdown = (props: Props) => {
  const {defaultActiveIdx, onChange, organizations: organizationsRef, menuProps} = props
  const organizations = useFragment(
    graphql`
      fragment NewTeamOrgDropdown_organizations on Organization @relay(plural: true) {
        id
        name
        tier
      }
    `,
    organizationsRef
  )
  return (
    <Menu
      ariaLabel={'Select the organization the new team belongs to'}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx + 1}
    >
      <DropdownMenuLabel>Select Organization:</DropdownMenuLabel>
      {organizations.map((anOrg) => {
        const {id, tier, name} = anOrg
        return (
          <MenuItem
            key={id}
            label={
              <DropdownMenuItemLabel>
                <span>{name}</span>
                {tier !== 'starter' && <TierTag tier={tier} />}
              </DropdownMenuItemLabel>
            }
            onClick={() => {
              onChange(id)
            }}
          />
        )
      })}
    </Menu>
  )
}

export default NewTeamOrgDropdown

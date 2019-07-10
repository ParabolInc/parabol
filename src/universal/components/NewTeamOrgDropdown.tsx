import {NewTeamOrgDropdown_organizations} from '__generated__/NewTeamOrgDropdown_organizations.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import DropdownMenuItemLabel from 'universal/components/DropdownMenuItemLabel'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import TagPro from 'universal/components/Tag/TagPro'
import {MenuProps} from 'universal/hooks/useMenu'
import {PRO} from 'universal/utils/constants'

interface Props {
  menuProps: MenuProps
  defaultActiveIdx: number
  onChange: (orgId: string) => void
  organizations: NewTeamOrgDropdown_organizations
}

const NewTeamOrgDropdown = (props: Props) => {
  const {defaultActiveIdx, onChange, organizations, menuProps} = props
  return (
    <Menu
      ariaLabel={'Select the organization the new team belongs to'}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx + 1}
    >
      <DropdownMenuLabel>Select Organization:</DropdownMenuLabel>
      {organizations.map((anOrg) => {
        return (
          <MenuItem
            key={anOrg.id}
            label={
              <DropdownMenuItemLabel>
                <span>{anOrg.name}</span>
                {anOrg.tier === PRO && <TagPro />}
              </DropdownMenuItemLabel>
            }
            onClick={() => {
              onChange(anOrg.id)
            }}
          />
        )
      })}
    </Menu>
  )
}

export default createFragmentContainer(NewTeamOrgDropdown, {
  organizations: graphql`
    fragment NewTeamOrgDropdown_organizations on Organization @relay(plural: true) {
      id
      name
      tier
    }
  `
})

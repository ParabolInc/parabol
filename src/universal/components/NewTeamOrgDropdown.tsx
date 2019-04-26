import React from 'react'
import styled from 'react-emotion'
import Menu from 'universal/components/Menu'
import {PRO} from 'universal/utils/constants'
import TagPro from 'universal/components/Tag/TagPro'
import MenuItem from 'universal/components/MenuItem'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'
import DropdownMenuItemLabel from 'universal/components/DropdownMenuItemLabel'
import {createFragmentContainer, graphql} from 'react-relay'
import {NewTeamOrgDropdown_organizations} from '__generated__/NewTeamOrgDropdown_organizations.graphql'

interface Props {
  closePortal: () => void
  defaultActiveIdx: number
  onChange: (orgId: string) => void
  organizations: NewTeamOrgDropdown_organizations
}

const WideMenu = styled(Menu)({
  minWidth: 256
})

const NewTeamOrgDropdown = (props: Props) => {
  const {defaultActiveIdx, onChange, organizations, closePortal} = props
  return (
    <WideMenu
      ariaLabel={'Select the organization the new team belongs to'}
      closePortal={closePortal}
      defaultActiveIdx={defaultActiveIdx + 1}
    >
      <DropdownMenuLabel notMenuItem>Select Organization:</DropdownMenuLabel>
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
    </WideMenu>
  )
}

export default createFragmentContainer(
  NewTeamOrgDropdown,
  graphql`
    fragment NewTeamOrgDropdown_organizations on Organization @relay(plural: true) {
      id
      name
      tier
    }
  `
)

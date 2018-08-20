// @flow
import React from 'react'
import MenuWithShortcuts from 'universal/components/MenuWithShortcuts'
import {PRO} from 'universal/utils/constants'
import TagPro from 'universal/components/Tag/TagPro'
import MenuItemWithShortcuts from 'universal/components/MenuItemWithShortcuts'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'
import DropdownMenuItemLabel from 'universal/components/DropdownMenuItemLabel'

type Props = {
  closePortal: () => void,
  onChange: (orgId: string) => void,
  organizations: Array<any>
}

const NewTeamOrgDropdown = (props: Props) => {
  const {onChange, organizations, closePortal} = props
  return (
    <MenuWithShortcuts
      ariaLabel={'Select the organization the new team belongs to'}
      closePortal={closePortal}
    >
      <DropdownMenuLabel>Select Organization:</DropdownMenuLabel>
      {organizations.map((anOrg) => {
        return (
          <MenuItemWithShortcuts
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
    </MenuWithShortcuts>
  )
}

export default NewTeamOrgDropdown

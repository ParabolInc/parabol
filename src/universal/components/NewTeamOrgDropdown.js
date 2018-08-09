// @flow
import React from 'react'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import MenuWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuWithShortcuts'
import styled from 'react-emotion'
import {PRO} from 'universal/utils/constants'
import textOverflow from 'universal/styles/helpers/textOverflow'
import TagPro from 'universal/components/Tag/TagPro'
import MenuItemWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuItemWithShortcuts'

const Label = styled('div')({
  ...textOverflow,
  borderBottom: `1px solid ${appTheme.palette.mid30l}`,
  color: ui.palette.dark,
  fontSize: ui.menuItemFontSize,
  fontWeight: 600,
  lineHeight: ui.menuItemHeight,
  marginBottom: ui.menuGutterVertical,
  padding: `0 ${ui.menuGutterHorizontal}`,
  userSelect: 'none'
})

type Props = {
  closePortal: () => void,
  onChange: () => void,
  organizations: Array<any>
}

const MenuItemLabel = styled('span')({
  ...textOverflow,
  fontSize: ui.menuItemFontSize,
  lineHeight: ui.menuItemHeight,
  padding: `0 ${ui.menuGutterHorizontal}`
})

const NewTeamOrgDropdown = (props: Props) => {
  const {onChange, organizations, closePortal} = props
  return (
    <MenuWithShortcuts
      ariaLabel={'Select the organization the new team belongs to'}
      closePortal={closePortal}
    >
      <Label>Select Organization:</Label>
      {organizations.map((anOrg) => {
        return (
          <MenuItemWithShortcuts
            key={anOrg.id}
            label={
              <MenuItemLabel>
                <span>{anOrg.name}</span>
                {anOrg.tier === PRO && <TagPro />}
              </MenuItemLabel>
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

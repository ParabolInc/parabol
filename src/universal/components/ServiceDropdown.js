// @flow
import React from 'react'
import ui from 'universal/styles/ui'
import MenuWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuWithShortcuts'
import styled from 'react-emotion'
import textOverflow from 'universal/styles/helpers/textOverflow'
import MenuItemWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuItemWithShortcuts'
import LoadingComponent from 'universal/components/ErrorComponent/ErrorComponent'

type Props = {
  closePortal: () => void,
  handleItemClick: () => void,
  isLoaded: boolean,
  options: Array<any>
}

const MenuItemLabel = styled('span')({
  ...textOverflow,
  fontSize: ui.menuItemFontSize,
  lineHeight: ui.menuItemHeight,
  padding: `0 ${ui.menuGutterHorizontal}`
})

const ServiceDropdown = (props: Props) => {
  const {handleItemClick, isLoaded, options, closePortal} = props
  if (!isLoaded) return <LoadingComponent height={100} width={'100%'} />
  return (
    <MenuWithShortcuts ariaLabel={'Select the service to integrate'} closePortal={closePortal}>
      {options.map((option) => {
        return (
          <MenuItemWithShortcuts
            key={option.id}
            label={<MenuItemLabel>{option.label}</MenuItemLabel>}
            onClick={() => {
              handleItemClick(option)
            }}
          />
        )
      })}
    </MenuWithShortcuts>
  )
}

export default ServiceDropdown

import React from 'react'
import MenuWithShortcuts from 'universal/components/MenuWithShortcuts'
import MenuItemWithShortcuts from 'universal/components/MenuItemWithShortcuts'
import DropdownMenuItemLabel from 'universal/components/DropdownMenuItemLabel'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'

interface Option {
  id: string
  label: string
}
interface Props {
  closePortal: () => void
  handleItemClick: (option: Option) => () => void
  isLoaded: boolean
  options: Array<Option>
}

const ServiceDropdown = (props: Props) => {
  const {handleItemClick, isLoaded, options, closePortal} = props
  if (!isLoaded) return <LoadingComponent height={100} width={'100%'} />
  return (
    <MenuWithShortcuts ariaLabel={'Select the service to integrate'} closePortal={closePortal}>
      {options.map((option) => {
        return (
          <MenuItemWithShortcuts
            key={option.id}
            label={<DropdownMenuItemLabel>{option.label}</DropdownMenuItemLabel>}
            onClick={handleItemClick(option)}
          />
        )
      })}
    </MenuWithShortcuts>
  )
}

export default ServiceDropdown

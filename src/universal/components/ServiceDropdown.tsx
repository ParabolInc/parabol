import React from 'react'
import styled from 'react-emotion'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import DropdownMenuItemLabel from 'universal/components/DropdownMenuItemLabel'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'
import {MenuProps} from 'universal/hooks/useMenu'

export interface ServiceDropdownOption {
  id: string
  label: string
}
interface Props {
  menuProps: MenuProps
  handleItemClick: (option: ServiceDropdownOption) => () => void
  isLoaded: boolean
  options: Array<ServiceDropdownOption>
}

const WideMenu = styled(Menu)({
  maxWidth: 'inherit'
})

const ServiceDropdown = (props: Props) => {
  const {handleItemClick, isLoaded, options, menuProps} = props
  if (!isLoaded) return <LoadingComponent height={100} width={'100%'} />
  return (
    <WideMenu ariaLabel={'Select the service to integrate'} {...menuProps}>
      {options.map((option) => {
        return (
          <MenuItem
            key={option.id}
            label={<DropdownMenuItemLabel>{option.label}</DropdownMenuItemLabel>}
            onClick={handleItemClick(option)}
          />
        )
      })}
    </WideMenu>
  )
}

export default ServiceDropdown

import React from 'react'
import DropdownMenuToggle from 'universal/components/DropdownMenuToggle'
import {ServiceDropdownOption} from 'universal/components/ServiceDropdown'
import {MenuPosition} from 'universal/hooks/useCoords'
import useMenu from 'universal/hooks/useMenu'
import lazyPreload from 'universal/utils/lazyPreload'

const ServiceDropdown = lazyPreload(() =>
  import(/* webpackChunkName: 'ServiceDropdown' */
  'universal/components/ServiceDropdown')
)

interface Props {
  isLoaded: boolean
  fetchOptions: () => void
  dropdownText: string
  handleItemClick: (option: ServiceDropdownOption) => () => void
  options: Array<ServiceDropdownOption>
}
const ServiceDropdownInput = (props: Props) => {
  const {isLoaded, fetchOptions, dropdownText, handleItemClick, options} = props
  const {menuPortal, togglePortal, originRef, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })
  const onClick = () => {
    fetchOptions()
    togglePortal()
  }
  return (
    <>
      <DropdownMenuToggle
        onMouseEnter={ServiceDropdown.preload}
        onClick={onClick}
        ref={originRef}
        defaultText={dropdownText}
      />
      {menuPortal(
        <ServiceDropdown
          menuProps={menuProps}
          handleItemClick={handleItemClick}
          isLoaded={isLoaded}
          options={options}
        />
      )}
    </>
  )
}

export default ServiceDropdownInput

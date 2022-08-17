import React, {forwardRef} from 'react'
import useMenu from '../hooks/useMenu'
import DropdownToggleInner from './DropdownToggleInner'
import DropdownToggleV2 from './DropdownToggleV2'

interface Props {
  className?: string
  icon?: React.ReactElement
  dropdownIcon?: string
  label: string
  disabled?: boolean
  onClick: ReturnType<typeof useMenu>['togglePortal']
  onMouseEnter?: () => void
  title?: string
}

const NewMeetingDropdown = forwardRef((props: Props, ref: any) => {
  const {className, icon, dropdownIcon, label, disabled, onClick, onMouseEnter, title} = props
  return (
    <DropdownToggleV2
      className={className}
      icon={dropdownIcon}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      disabled={disabled}
      ref={ref}
    >
      <DropdownToggleInner icon={icon} label={label} title={title} />
    </DropdownToggleV2>
  )
})

export default NewMeetingDropdown

import styled from '@emotion/styled'
import React, {forwardRef} from 'react'
import useMenu from '../hooks/useMenu'
import DropdownToggleInner from './DropdownToggleInner'
import DropdownToggleV2 from './DropdownToggleV2'

const StyledDropdown = styled(DropdownToggleV2)({
  flexGrow: 1,
  flexShrink: 1,
  //flexBasis: 0,
  minWidth: '50%',
  overflow: 'hidden'
})

interface Props {
  className?: string
  icon?: React.ReactElement
  dropdownIcon?: string
  label: string
  disabled?: boolean
  onClick: ReturnType<typeof useMenu>['togglePortal']
  onMouseEnter: () => void
  title: string
}

const NewMeetingDropdown = forwardRef((props: Props, ref: any) => {
  const {className, icon, dropdownIcon, label, disabled, onClick, onMouseEnter, title} = props
  return (
    <StyledDropdown
      className={className}
      icon={dropdownIcon}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      disabled={disabled}
      ref={ref}
    >
      <DropdownToggleInner icon={icon} label={label} title={title} />
    </StyledDropdown>
  )
})

export default NewMeetingDropdown

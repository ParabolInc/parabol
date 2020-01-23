import React, {forwardRef, ReactNode, Ref} from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import useMenu from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'

const DropdownIcon = styled(Icon)({
  color: PALETTE.TEXT_MAIN,
  padding: 12,
  fontSize: ICON_SIZE.MD24
})

const DropdownBlock = styled('div')<{disabled: boolean | undefined}>(({disabled}) => ({
  background: '#fff',
  border: `2px solid ${PALETTE.BORDER_DROPDOWN}`,
  borderRadius: '4px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  display: 'flex',
  fontSize: 16,
  lineHeight: '24px',
  fontWeight: 600,
  userSelect: 'none',
  width: '100%'
}))

interface Props {
  className?: string
  disabled?: boolean
  onClick: ReturnType<typeof useMenu>['togglePortal']
  onMouseEnter?: () => void
  children: ReactNode
}

const DropdownToggleV2 = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {className, children, onClick, onMouseEnter, disabled} = props
  return (
    <DropdownBlock
      className={className}
      disabled={disabled}
      onMouseEnter={onMouseEnter}
      ref={ref}
      onClick={disabled ? undefined : onClick}
    >
      {children}
      {!disabled && <DropdownIcon>expand_more</DropdownIcon>}
    </DropdownBlock>
  )
})

export default DropdownToggleV2

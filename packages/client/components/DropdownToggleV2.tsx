import styled from '@emotion/styled'
import {ExpandMore as ExpandMoreIcon, KeyboardArrowRight} from '@mui/icons-material'
import React, {forwardRef, ReactNode, Ref} from 'react'
import useMenu from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'

const DropdownIcon = styled('div')<{opened: boolean | undefined}>(({opened}) => ({
  color: PALETTE.SLATE_600,
  height: 36,
  width: 36,
  '& svg': {
    fontSize: 36
  },
  alignSelf: 'center',
  transform: opened ? 'rotateX(180deg)' : 'none',
  transition: 'transform 0.2s'
}))

const DropdownBlock = styled('div')<{disabled: boolean | undefined}>(({disabled}) => ({
  background: PALETTE.SLATE_200,
  borderRadius: '8px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  display: 'flex',
  fontSize: 14,
  lineHeight: '24px',
  fontWeight: 600,
  userSelect: 'none',
  width: '100%',
  ':hover': {
    backgroundColor: PALETTE.SLATE_300
  },
  padding: 16
}))

interface Props {
  className?: string
  disabled?: boolean
  icon?: string
  onClick: ReturnType<typeof useMenu>['togglePortal']
  onMouseEnter?: () => void
  children: ReactNode
  opened?: boolean
}

const DropdownToggleV2 = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {className, children, icon, onClick, onMouseEnter, disabled, opened} = props
  return (
    <DropdownBlock
      className={className}
      disabled={disabled}
      onMouseEnter={onMouseEnter}
      ref={ref}
      onClick={disabled ? undefined : onClick}
    >
      {children}
      {!disabled && (
        <DropdownIcon opened={opened}>
          {icon ? <KeyboardArrowRight /> : <ExpandMoreIcon />}
        </DropdownIcon>
      )}
    </DropdownBlock>
  )
})

export default DropdownToggleV2

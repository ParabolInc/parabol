/* DEPRECATED. SEE DropdownToggleV2 */
import styled from '@emotion/styled'
import {ExpandMore} from '@mui/icons-material'
import React, {forwardRef, ReactElement, Ref} from 'react'
import useMenu from '../hooks/useMenu'
import makeFieldColorPalette from '../styles/helpers/makeFieldColorPalette'
import {PALETTE} from '../styles/paletteV3'
import ui from '../styles/ui'

const DropdownIcon = styled(ExpandMore)({
  color: PALETTE.SLATE_600,
  marginLeft: 8
})

const DropdownBlock = styled('div')({
  display: 'inline-block',
  margin: '0 auto',
  maxWidth: '100%',
  width: '100%'
})

interface InputStyleProps {
  disabled: boolean
  flat: boolean | undefined
  size?: 'small' | 'medium' | 'large'
}

const InputBlock = styled('div')<InputStyleProps>(
  ({disabled, size}) => ({
    ...ui.fieldBaseStyles,
    ...ui.fieldSizeStyles[size!],
    ...makeFieldColorPalette('white', !disabled),
    cursor: 'pointer',
    position: 'relative',
    userSelect: 'none'
  }),
  ({disabled}) => disabled && {...ui.fieldDisabled},
  ({flat}) => flat && {borderColor: 'transparent'},
  {
    alignItems: 'center',
    display: 'flex'
  }
)

const Value = styled('span')({
  display: 'flex',
  flex: 1,
  minWidth: 0
})

interface Props {
  className?: string
  defaultText: string | ReactElement<any>
  disabled?: boolean
  onClick: ReturnType<typeof useMenu>['togglePortal']
  onMouseEnter?: () => void
  // style hacks until a better pattern
  flat?: boolean
  size?: 'small' | 'medium' | 'large'
}

const DropdownMenuToggle = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {className, onClick, onMouseEnter, defaultText, disabled, flat, size} = props
  return (
    <DropdownBlock
      className={className}
      onMouseEnter={onMouseEnter}
      ref={ref}
      onClick={disabled ? undefined : onClick}
    >
      <InputBlock disabled={!!disabled} flat={flat} size={size || 'medium'} tabIndex={0}>
        <Value>{defaultText}</Value>
        {!disabled && <DropdownIcon />}
      </InputBlock>
    </DropdownBlock>
  )
})

export default DropdownMenuToggle

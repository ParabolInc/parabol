import React, {forwardRef, ReactElement} from 'react'
import styled from 'react-emotion'
import Icon from 'universal/components/Icon'
import useMenu from 'universal/hooks/useMenu'
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette'
import ui from 'universal/styles/ui'
import {PALETTE} from 'universal/styles/paletteV2'

const DropdownIcon = styled(Icon)({
  color: PALETTE.TEXT.LIGHT
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
  size?: string
}

const InputBlock = styled('div')<InputStyleProps>(
  ({disabled, size}) => ({
    ...ui.fieldBaseStyles,
    ...ui.fieldSizeStyles[size],
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
  display: 'block',
  flex: 1
})

interface Props {
  className?: string
  defaultText: string | ReactElement<any>
  disabled?: boolean
  onClick: ReturnType<typeof useMenu>['togglePortal']
  onMouseEnter?: () => void
  // hack to get around extending this component with styles
  innerRef?: any
  // style hacks until a better pattern
  flat?: boolean
  size?: string
}

const DropdownMenuToggle = forwardRef((props: Props, ref: any) => {
  const {className, onClick, onMouseEnter, defaultText, disabled, flat, size} = props
  return (
    <DropdownBlock
      className={className}
      onMouseEnter={onMouseEnter}
      innerRef={ref}
      onClick={disabled ? undefined : onClick}
    >
      <InputBlock disabled={!!disabled} flat={flat} size={size || 'medium'} tabIndex={0}>
        <Value>{defaultText}</Value>
        {!disabled && <DropdownIcon>expand_more</DropdownIcon>}
      </InputBlock>
    </DropdownBlock>
  )
})

export default DropdownMenuToggle

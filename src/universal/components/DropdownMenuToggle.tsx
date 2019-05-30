import React, {forwardRef, ReactElement} from 'react'
import styled from 'react-emotion'
import FieldBlock from 'universal/components/FieldBlock/FieldBlock'
import Icon from 'universal/components/Icon'
import useMenu from 'universal/hooks/useMenu'
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette'
import {ICON_SIZE} from 'universal/styles/typographyV2'
import ui from 'universal/styles/ui'

const DownButtonIcon = styled(Icon)({
  cursor: 'pointer',
  paddingRight: 16,
  lineHeight: '38px',
  right: '-1px',
  height: '100%',
  position: 'absolute',
  textAlign: 'right',
  top: 0,
  width: '100%',
  fontSize: ICON_SIZE.MD18
})

const DropdownBlock = styled('div')({
  display: 'inline-block',
  width: '100%'
})

const InputBlock = styled('div')(
  ({disabled}: {disabled: boolean}) => ({
    ...ui.fieldBaseStyles,
    ...ui.fieldSizeStyles.medium,
    ...makeFieldColorPalette('white', !disabled),
    position: 'relative',
    userSelect: 'none'
  }),
  ({disabled}: {disabled: boolean}) => disabled && {...ui.fieldDisabled}
)

interface Props {
  className?: string
  defaultText: string | ReactElement<any>
  disabled?: boolean
  onClick: ReturnType<typeof useMenu>['togglePortal']
  onMouseEnter: () => void
}

const DropdownMenuToggle = forwardRef((props: Props, ref: any) => {
  const {className, onClick, onMouseEnter, defaultText, disabled} = props
  return (
    <DropdownBlock
      className={className}
      onMouseEnter={onMouseEnter}
      innerRef={ref}
      onClick={onClick}
    >
      <FieldBlock>
        <InputBlock disabled={!!disabled} tabIndex={1}>
          <span>{defaultText}</span>
          {!disabled && <DownButtonIcon>expand_more</DownButtonIcon>}
        </InputBlock>
      </FieldBlock>
    </DropdownBlock>
  )
})

export default DropdownMenuToggle

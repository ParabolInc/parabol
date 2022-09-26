import styled from '@emotion/styled'
import React, {forwardRef, ReactNode} from 'react'
import {ICON_SIZE} from '../styles/typographyV2'
import Icon from './Icon'

const LabelBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center'
})

const Label = styled('div')<{iconAfter?: boolean}>(({iconAfter}) => ({
  color: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  margin: iconAfter ? `0 8px 0 0` : `0 0 0 8px`,
  whiteSpace: 'nowrap'
}))

const StyledIcon = styled(Icon)<Pick<Props, 'iconAfter' | 'iconLarge'>>(
  ({iconAfter, iconLarge}) => ({
    color: 'inherit',
    display: 'block',
    fontSize: iconLarge ? ICON_SIZE.MD24 : ICON_SIZE.MD18,
    order: iconAfter ? 2 : undefined
  })
)

interface Props {
  icon: string
  iconAfter?: boolean
  iconLarge?: boolean
  label?: ReactNode
  onMouseEnter?(): void
  onMouseLeave?(): void
  onClick?(): void
}

const IconLabel = forwardRef((props: Props, ref: any) => {
  const {icon, label, onClick, onMouseEnter, onMouseLeave, iconAfter, iconLarge} = props
  return (
    <LabelBlock ref={ref} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick}>
      <StyledIcon iconAfter={iconAfter} iconLarge={iconLarge}>
        {icon}
      </StyledIcon>
      {label && <Label iconAfter={iconAfter}>{label}</Label>}
    </LabelBlock>
  )
})

export default IconLabel

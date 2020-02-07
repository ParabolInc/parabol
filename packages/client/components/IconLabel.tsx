import React, {ReactNode, forwardRef} from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import {ICON_SIZE} from '../styles/typographyV2'

const LabelBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center'
})

const Label = styled('div')<Pick<Props, 'iconAfter'>>(({iconAfter}) => {
  const gutter = '8px'
  return {
    color: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    margin: iconAfter ? `0 ${gutter} 0 0` : `0 0 0 ${gutter}`,
    whiteSpace: 'nowrap'
  }
})

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
}

const IconLabel = forwardRef((props: Props, ref: any) => {
  const {icon, label, onMouseEnter, onMouseLeave, iconAfter, iconLarge} = props
  return (
    <LabelBlock ref={ref} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <StyledIcon iconAfter={iconAfter} iconLarge={iconLarge}>
        {icon}
      </StyledIcon>
      {label && (
        <Label iconAfter={iconAfter} iconLarge={iconLarge}>
          {label}
        </Label>
      )}
    </LabelBlock>
  )
})

export default IconLabel

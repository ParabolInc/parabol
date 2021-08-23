import React, {ReactNode, forwardRef} from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import {ICON_SIZE} from '../styles/typographyV2'

const LabelBlock = styled('div')<{labelBelow?: boolean}>(({labelBelow}) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: labelBelow ? 'column' : undefined
}))

const Label = styled('div')<{iconAfter?: boolean; labelBelow?: boolean}>(
  ({iconAfter, labelBelow}) => ({
    color: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    margin: labelBelow ? `4px 0 0 0` : iconAfter ? `0 8px 0 0` : `0 0 0 8px`,
    whiteSpace: 'nowrap'
  })
)

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
  labelBelow?: boolean
  onMouseEnter?(): void
  onMouseLeave?(): void
  onClick?(): void
}

const IconLabel = forwardRef((props: Props, ref: any) => {
  const {icon, label, labelBelow, onClick, onMouseEnter, onMouseLeave, iconAfter, iconLarge} = props
  return (
    <LabelBlock
      ref={ref}
      labelBelow={labelBelow}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <StyledIcon iconAfter={iconAfter} iconLarge={iconLarge}>
        {icon}
      </StyledIcon>
      {label && (
        <Label iconAfter={iconAfter} labelBelow={labelBelow}>
          {label}
        </Label>
      )}
    </LabelBlock>
  )
})

export default IconLabel

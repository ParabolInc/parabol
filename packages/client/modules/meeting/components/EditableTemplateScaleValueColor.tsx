import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import Icon from '~/components/Icon'
import PlainButton from '~/components/PlainButton/PlainButton'
import {BezierCurve} from '~/types/constEnums'
import {EditableTemplateScaleValueColor_scaleValue} from '~/__generated__/EditableTemplateScaleValueColor_scaleValue.graphql'
import {EditableTemplateScaleValueColor_scale} from '~/__generated__/EditableTemplateScaleValueColor_scale.graphql'
import ScaleValuePalettePicker from './ScaleValuePalettePicker'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import {PALETTE} from '../../../styles/paletteV2'
import {ICON_SIZE} from '../../../styles/typographyV2'

interface Props {
  isOwner: boolean
  scaleValue: EditableTemplateScaleValueColor_scaleValue
  scale: EditableTemplateScaleValueColor_scale
}

const ScaleValueColor = styled(PlainButton)<{isOwner: boolean}>(({isOwner}) => ({
  cursor: isOwner ? 'pointer' : 'default',
  display: 'block',
  flex: 1,
  height: 24,
  padding: 4,
  position: 'relative',
  width: 24,
  ':hover': {
    i: {
      opacity: isOwner ? 1 : undefined
    }
  }
}))

const ColorBadge = styled('div')<{color?: string}>(({color}) => ({
  backgroundColor: color,
  borderRadius: '50%',
  height: 14,
  width: 14
}))

const DropdownIcon = styled(Icon)({
  bottom: 0,
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD18,
  height: 24,
  lineHeight: '24px',
  opacity: 0,
  position: 'absolute',
  right: -6,
  transition: `opacity 300ms ${BezierCurve.DECELERATE}`,
  width: 12
})

const EditableTemplateScaleValueColor = (props: Props) => {
  const {isOwner, scaleValue, scale} = props
  const {color} = scaleValue
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu<HTMLButtonElement>(
    MenuPosition.UPPER_LEFT,
    {parentId: 'templateModal'}
  )
  return (
    <ScaleValueColor ref={originRef} isOwner={isOwner} onClick={isOwner ? togglePortal : undefined}>
      <ColorBadge color={color} />
      <DropdownIcon>arrow_drop_down</DropdownIcon>
      {menuPortal(<ScaleValuePalettePicker menuProps={menuProps} scaleValue={scaleValue} scale={scale} />)}
    </ScaleValueColor>
  )
}

export default createFragmentContainer(EditableTemplateScaleValueColor, {
  scale: graphql`
    fragment EditableTemplateScaleValueColor_scale on TemplateScale {
      ...ScaleValuePalettePicker_scale
    }
  `,
  scaleValue: graphql`
    fragment EditableTemplateScaleValueColor_scaleValue on TemplateScaleValue {
      ...ScaleValuePalettePicker_scaleValue
      color
    }
  `
})

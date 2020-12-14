import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import Icon from '~/components/Icon'
import PlainButton from '~/components/PlainButton/PlainButton'
import {BezierCurve} from '~/types/constEnums'
import {EditableTemplateScaleValueColor_scale} from '~/__generated__/EditableTemplateScaleValueColor_scale.graphql'
import ScaleValuePalettePicker from './ScaleValuePalettePicker'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import {PALETTE} from '../../../styles/paletteV2'
import {ICON_SIZE} from '../../../styles/typographyV2'

interface Props {
  isOwner: boolean
  scale: EditableTemplateScaleValueColor_scale
  scaleValueLabel: string
  scaleValueColor: string
  setScaleValueColor?: (scaleValueColor: string) => void
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
  const {isOwner, scaleValueLabel, scaleValueColor, scale, setScaleValueColor} = props
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu<HTMLButtonElement>(
    MenuPosition.UPPER_LEFT,
    {parentId: 'templateModal'}
  )
  return (
    <ScaleValueColor ref={originRef} isOwner={isOwner} onClick={isOwner ? togglePortal : undefined}>
      <ColorBadge color={scaleValueColor} />
      <DropdownIcon>arrow_drop_down</DropdownIcon>
      {menuPortal(<ScaleValuePalettePicker menuProps={menuProps}
        scaleValueLabel={scaleValueLabel}
        scaleValueColor={scaleValueColor}
        scale={scale}
        setScaleValueColor={setScaleValueColor}
      />)}
    </ScaleValueColor>
  )
}

export default createFragmentContainer(EditableTemplateScaleValueColor, {
  scale: graphql`
    fragment EditableTemplateScaleValueColor_scale on TemplateScale {
      ...ScaleValuePalettePicker_scale
    }
  `
})

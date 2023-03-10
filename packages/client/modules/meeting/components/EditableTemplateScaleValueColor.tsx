import styled from '@emotion/styled'
import {ArrowDropDown as ArrowDropDownIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import PlainButton from '~/components/PlainButton/PlainButton'
import {BezierCurve} from '~/types/constEnums'
import {EditableTemplateScaleValueColor_scale$key} from '~/__generated__/EditableTemplateScaleValueColor_scale.graphql'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import {PALETTE} from '../../../styles/paletteV3'
import ScaleValuePalettePicker from './ScaleValuePalettePicker'

interface Props {
  scale: EditableTemplateScaleValueColor_scale$key
  scaleValueLabel: string
  scaleValueColor: string
  setScaleValueColor?: (scaleValueColor: string) => void
}

const ScaleValueColor = styled(PlainButton)({
  cursor: 'pointer',
  display: 'block',
  flex: 1,
  flexShrink: 0,
  height: 24,
  padding: 4,
  position: 'relative',
  width: 24,
  ':hover': {
    i: {
      opacity: 1
    }
  }
})

const ColorBadge = styled('div')<{color?: string}>(({color}) => ({
  backgroundColor: color,
  borderRadius: '50%',
  height: 14,
  margin: 1,
  width: 14
}))

const DropdownIcon = styled('div')({
  bottom: 0,
  color: PALETTE.SLATE_600,
  svg: {
    fontSize: 18
  },
  height: 24,
  opacity: 0,
  position: 'absolute',
  right: -6,
  transition: `opacity 300ms ${BezierCurve.DECELERATE}`,
  width: 12
})

const EditableTemplateScaleValueColor = (props: Props) => {
  const {scaleValueLabel, scaleValueColor, scale: scaleRef, setScaleValueColor} = props
  const scale = useFragment(
    graphql`
      fragment EditableTemplateScaleValueColor_scale on TemplateScale {
        ...ScaleValuePalettePicker_scale
      }
    `,
    scaleRef
  )
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu<HTMLButtonElement>(
    MenuPosition.UPPER_LEFT,
    {parentId: 'templateModal'}
  )
  return (
    <ScaleValueColor ref={originRef} onClick={togglePortal}>
      <ColorBadge color={scaleValueColor} />
      <DropdownIcon>
        <ArrowDropDownIcon />
      </DropdownIcon>
      {menuPortal(
        <ScaleValuePalettePicker
          menuProps={menuProps}
          scaleValueLabel={scaleValueLabel}
          scaleValueColor={scaleValueColor}
          scale={scale}
          setScaleValueColor={setScaleValueColor}
        />
      )}
    </ScaleValueColor>
  )
}

export default EditableTemplateScaleValueColor

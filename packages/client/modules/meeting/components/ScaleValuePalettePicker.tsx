import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import Menu from '~/components/Menu'
import PaletteColor from '~/components/PaletteColor/PaletteColor'
import UpdatePokerTemplateScaleValueMutation from '~/mutations/UpdatePokerTemplateScaleValueMutation'
import palettePickerOptions from '~/styles/palettePickerOptions'
import {ScaleValuePalettePicker_scaleValue} from '../../../__generated__/ScaleValuePalettePicker_scaleValue.graphql'
import {ScaleValuePalettePicker_scaleValues} from '../../../__generated__/ScaleValuePalettePicker_scaleValues.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {MenuProps} from '../../../hooks/useMenu'
import useMutationProps from '../../../hooks/useMutationProps'

interface Props {
  scaleValue: ScaleValuePalettePicker_scaleValue
  scaleValues: ScaleValuePalettePicker_scaleValues
  menuProps: MenuProps
}

const ScaleValuePaletteDropDown = styled(Menu)({
  width: '214px',
  minWidth: '214px',
  padding: 5
})

const ScaleValuePaletteList = styled('ul')({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  listStyle: 'none',
  padding: 0,
  margin: 0
})

const ScaleValuePalettePicker = (props: Props) => {
  const {scaleValue, scaleValues, menuProps} = props
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const {closePortal} = menuProps
  const {id: scaleValueId, color: scaleValueColor} = scaleValue
  const atmosphere = useAtmosphere()
  const allTakenColors = scaleValues.map((scaleValue) => scaleValue.color)
  const handleClick = (newColor: string) => {
    if (submitting) return
    submitMutation()
    const scaleId = scaleValueId.split(":")[0]
    const oldScaleValue = scaleValue
    const newScaleValue = {...scaleValue, color: newColor}

    UpdatePokerTemplateScaleValueMutation(atmosphere, {scaleId, oldScaleValue, newScaleValue}, {}, onError, onCompleted)
    closePortal()
  }

  return (
    <ScaleValuePaletteDropDown ariaLabel='Pick a group color' {...menuProps}>
      <ScaleValuePaletteList>
        {palettePickerOptions.map((color) => {
          return (
            <PaletteColor
              key={color.hex}
              color={color}
              isAvailable={!allTakenColors.includes(color.hex)}
              isCurrentColor={scaleValueColor === color.hex}
              handleClick={handleClick}
            />
          )
        })}
      </ScaleValuePaletteList>
    </ScaleValuePaletteDropDown>
  )
}

export default createFragmentContainer(ScaleValuePalettePicker, {
  scaleValues: graphql`
    fragment ScaleValuePalettePicker_scaleValues on TemplateScaleValue @relay(plural: true) {
      label
      value
      color
    }
  `,
  scaleValue: graphql`
    fragment ScaleValuePalettePicker_scaleValue on TemplateScaleValue {
      id
      label
      value
      color
    }
  `
})

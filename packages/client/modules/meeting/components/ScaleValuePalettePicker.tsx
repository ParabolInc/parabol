import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import PaletteColor from '~/components/PaletteColor/PaletteColor'
import UpdatePokerTemplateScaleValueMutation from '~/mutations/UpdatePokerTemplateScaleValueMutation'
import palettePickerOptions from '~/styles/palettePickerOptions'
import type {ScaleValuePalettePicker_scale$key} from '../../../__generated__/ScaleValuePalettePicker_scale.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import {MenuContent} from '../../../ui/Menu/MenuContent'

interface Props {
  scale: ScaleValuePalettePicker_scale$key
  scaleValueLabel: string
  scaleValueColor: string
  onClose: () => void
  setScaleValueColor?: (scaleValueColor: string) => void
}

const ScaleValuePalettePicker = (props: Props) => {
  const {scaleValueLabel, scaleValueColor, scale: scaleRef, onClose, setScaleValueColor} = props
  const scale = useFragment(
    graphql`
      fragment ScaleValuePalettePicker_scale on TemplateScale {
        id
        values {
          label
          color
        }
      }
    `,
    scaleRef
  )
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const allTakenColors = scale.values.map((scaleValue) => scaleValue.color)
  const handleClick = (newColor: string) => {
    if (setScaleValueColor) {
      setScaleValueColor(newColor)
      return
    }

    if (submitting) return
    submitMutation()

    const scaleId = scale.id
    const oldScaleValue = {label: scaleValueLabel, color: scaleValueColor}
    const newScaleValue = {...oldScaleValue, color: newColor}
    UpdatePokerTemplateScaleValueMutation(
      atmosphere,
      {scaleId, oldScaleValue, newScaleValue},
      {onError, onCompleted}
    )
    onClose()
  }

  return (
    <MenuContent align='start' className='w-[214px] min-w-[214px] p-[5px]'>
      <ul className='m-0 flex list-none flex-wrap justify-center p-0'>
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
      </ul>
    </MenuContent>
  )
}

export default ScaleValuePalettePicker

import palettePickerOptions from '../../../../client/styles/palettePickerOptions'
import {Threshold} from '../../../../client/types/constEnums'

const validateColorValue = (color: string, currentColor?: string) => {
  const upperColor = color.toUpperCase()
  if (upperColor === currentColor?.toUpperCase()) return true
  return palettePickerOptions.some(({hex}) => hex.toUpperCase() === upperColor)
}

const segmenter = new Intl.Segmenter('en', {granularity: 'grapheme'})
const validateScaleLabel = (label: string) => {
  const labelLength = [...segmenter.segment(label)].length
  return 0 < labelLength && labelLength <= Threshold.POKER_SCALE_VALUE_MAX_LENGTH
}

export {validateColorValue, validateScaleLabel}

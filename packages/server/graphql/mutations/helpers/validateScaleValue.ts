import palettePickerOptions from '../../../../client/styles/palettePickerOptions'
import {Threshold} from '../../../../client/types/constEnums'

const validateColorValue = (color: string) => {
  const validHexes = palettePickerOptions.map(({hex}) => hex)
  return validHexes.includes(color)
}

const segmenter = new Intl.Segmenter('en', {granularity: 'grapheme'})
const validateScaleLabel = (label: string) => {
  const labelLength = [...segmenter.segment(label)].length
  return 0 < labelLength && labelLength <= Threshold.POKER_SCALE_VALUE_MAX_LENGTH
}

export {validateColorValue, validateScaleLabel}

import toArray from 'lodash.toarray'
import palettePickerOptions from '../../../../client/styles/palettePickerOptions'
import {Threshold} from '../../../../client/types/constEnums'
import TemplateScaleValue from '../../../database/types/TemplateScaleValue'

const validateColorValue = (color: string) => {
  const validHexes = palettePickerOptions.map(({hex}) => hex)
  return validHexes.includes(color)
}

const validateScaleLabel = (label: string) => {
  // https://stackoverflow.com/a/46085147
  const labelArr = toArray(label)
  return 0 < labelArr.length && labelArr.length <= Threshold.POKER_SCALE_VALUE_MAX_LENGTH
}

const validateScaleLabelValueUniqueness = (scaleValues: TemplateScaleValue[]) => {
  const labelList = scaleValues.map((scaleValue) => scaleValue.label)

  return new Set(labelList).size === labelList.length
}

export {validateColorValue, validateScaleLabel, validateScaleLabelValueUniqueness}

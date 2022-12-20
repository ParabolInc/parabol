import palettePickerOptions from '../../../../client/styles/palettePickerOptions'
import TemplateScaleValue from '../../../database/types/TemplateScaleValue'

const validateColorValue = (color: string) => {
  const validHexes = palettePickerOptions.map(({hex}) => hex)
  return validHexes.includes(color)
}

const validateScaleLabel = (label: string) => {
  // label.length gives us the count of UTF-16 units, so 🔥 has a length of 2
  // Spreading the string into an array gives us the desired length in codepoints (characters): https://stackoverflow.com/a/54369605
  const labelArr = [...label]
  return 0 < labelArr.length && labelArr.length <= 2
}

const validateScaleLabelValueUniqueness = (scaleValues: TemplateScaleValue[]) => {
  const labelList = scaleValues.map((scaleValue) => scaleValue.label)

  return new Set(labelList).size === labelList.length
}

export {validateColorValue, validateScaleLabel, validateScaleLabelValueUniqueness}

import TemplateScaleValue from '../../../database/types/TemplateScaleValue'

const validateColorValue = (color: string) => {
  return /^#[0-9A-F]{6}$/i.test(color)
}

const validateScaleLabel = (label: string) => {
  return 0 < label.length && label.length <= 2
}

const validateScaleValue = (value: number, isSpecial: boolean) => {
  return isSpecial ? -1 <= value && value <= Math.pow(2, 31) - 1 : 0 <= value && value <= 99
}

const validateScaleLabelValueUniqueness = (scaleValues: TemplateScaleValue[]) => {
  const numericalValueList = scaleValues.map((scaleValue) => scaleValue.value)
  const labelList = scaleValues.map((scaleValue) => scaleValue.label)

  return (
    new Set(numericalValueList).size !== numericalValueList.length ||
    new Set(labelList).size !== labelList.length
  )
}

export {
  validateColorValue,
  validateScaleLabel,
  validateScaleValue,
  validateScaleLabelValueUniqueness
}

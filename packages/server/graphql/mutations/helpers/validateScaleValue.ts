const validateColorValue = (color: string) => {
  return /^#[0-9A-F]{6}$/i.test(color)
}

const validateScaleLabel = (label: string) => {
  return 0 < label.length && label.length <= 2
}

const validateScaleValue = (value: number) => {
  return 0 <= value && value <= 99
}

export {validateColorValue, validateScaleLabel, validateScaleValue}

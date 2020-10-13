export interface TemplateScaleValueInput {
  color: string
  label: string
  value: number
  isSpecial: boolean
}

export default class TemplateScaleValue {
  color: string
  label: string
  value: number
  isSpecial?: boolean
  constructor(input: TemplateScaleValueInput) {
    const {color, label, value, isSpecial} = input
    this.color = color
    this.label = label
    this.value = value
    this.isSpecial = isSpecial || false
  }
}

export interface TemplateScaleValueInput {
  color: string
  label: string
  value: number
}

export default class TemplateScaleValue {
  color: string
  label: string
  value: number
  constructor(input: TemplateScaleValueInput) {
    const {color, label, value} = input
    this.color = color
    this.label = label
    this.value = value
  }
}

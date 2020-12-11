export interface TemplateScaleValueInput {
  color: string
  label: string
  isSpecial: boolean
}

export default class TemplateScaleValue {
  color: string
  label: string
  isSpecial?: boolean
  constructor(input: TemplateScaleValueInput) {
    const {color, label, isSpecial} = input
    this.color = color
    this.label = label
    this.isSpecial = isSpecial || false
  }
}

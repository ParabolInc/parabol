interface Input {
  userId: string
  value: number
  label: string
}

export default class EstimateUserScore {
  userId: string
  value: number
  // label is included here because the TemplateScaleValue is mutable & we want to preserve history
  label: string
  constructor(input: Input) {
    const {userId, value, label} = input
    this.userId = userId
    this.value = value
    this.label = label
  }
}

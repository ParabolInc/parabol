interface Input {
  cloudId: string
  fieldId: string
  dimensionId: string
  fieldName: string
}

export default class JiraDimensionField {
  cloudId: string
  dimensionId: string
  fieldId: string
  fieldName: string
  constructor(input: Input) {
    const {cloudId, fieldId, dimensionId, fieldName} = input
    this.cloudId = cloudId
    this.fieldId = fieldId
    this.dimensionId = dimensionId
    this.fieldName = fieldName
  }
}

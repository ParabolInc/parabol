interface Input {
  dimensionId: string
  fieldName: string
}

export default class JiraDimensionField {
  dimensionId: string
  fieldName: string
  constructor(input: Input) {
    const {dimensionId, fieldName} = input
    this.dimensionId = dimensionId
    this.fieldName = fieldName
  }
}

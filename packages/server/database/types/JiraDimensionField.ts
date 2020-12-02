type FieldType = 'string' | 'number'
interface Input {
  cloudId: string
  fieldId: string
  dimensionId: string
  fieldName: string
  fieldType: FieldType
}

export default class JiraDimensionField {
  cloudId: string
  dimensionId: string
  fieldId: string
  fieldName: string
  fieldType: FieldType
  constructor(input: Input) {
    const {cloudId, fieldId, dimensionId, fieldName, fieldType} = input
    this.cloudId = cloudId
    this.fieldId = fieldId
    this.dimensionId = dimensionId
    this.fieldName = fieldName
    this.fieldType = fieldType
  }
}

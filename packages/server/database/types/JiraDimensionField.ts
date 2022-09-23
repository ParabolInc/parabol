type FieldType = 'string' | 'number'
interface Input {
  cloudId: string
  projectKey: string
  issueType: string
  dimensionName: string
  fieldId: string
  fieldName: string
  fieldType: FieldType
}

export default class JiraDimensionField {
  cloudId: string
  projectKey: string
  issueType: string
  dimensionName: string
  fieldId: string
  fieldName: string
  fieldType: FieldType
  constructor(input: Input) {
    const {cloudId, projectKey, issueType, dimensionName, fieldId, fieldName, fieldType } = input
    this.cloudId = cloudId
    this.projectKey = projectKey
    this.issueType = issueType
    this.dimensionName = dimensionName
    this.fieldId = fieldId
    this.fieldName = fieldName
    this.fieldType = fieldType
  }
}

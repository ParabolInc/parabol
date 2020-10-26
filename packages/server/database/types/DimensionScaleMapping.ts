export interface DimensionScaleMappingInput {
  dimensionId: string
  scaleId: string
}

export default class DimensionScaleMapping {
  dimensionId: string
  scaleId: string
  constructor(input: DimensionScaleMappingInput) {
    const {dimensionId, scaleId} = input
    this.dimensionId = dimensionId
    this.scaleId = scaleId
  }
}

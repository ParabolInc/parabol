import {TemplateScaleValueResolvers} from '../resolverTypes'

export type TemplateScaleValueSource = {
  color: string
  label: string
  sortOrder: number
  scaleId: string
}

const TemplateScaleValue: TemplateScaleValueResolvers = {
  id: ({scaleId, label}) => {
    return `${scaleId}:${label}`
  }
}

export default TemplateScaleValue

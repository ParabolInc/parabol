import {TemplateScaleRefResolvers} from '../resolverTypes'

const TemplateScaleRef: TemplateScaleRefResolvers = {
  values: ({id, values}) => {
    return values.map(({color, label}, index) => ({
      color,
      label,
      scaleId: id,
      sortOrder: index
    }))
  }
}

export default TemplateScaleRef

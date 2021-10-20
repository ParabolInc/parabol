import {MaybeReadonly} from '../../../client/types/generics'
import getPg from '../getPg'
import {
  getTemplateScaleRefsByIdsQuery,
  IGetTemplateScaleRefsByIdsQueryResult
} from './generated/getTemplateScaleRefsByIdsQuery'

export interface TemplateScaleRef extends IGetTemplateScaleRefsByIdsQueryResult {
  values: {
    color: string
    label: string
  }[]
}

const getTemplateScaleRefsByIds = async (scaleRefIds: MaybeReadonly<string[]>) => {
  const templateScaleRefs = await getTemplateScaleRefsByIdsQuery.run({scaleRefIds}, getPg())
  return templateScaleRefs as TemplateScaleRef[]
}
export default getTemplateScaleRefsByIds

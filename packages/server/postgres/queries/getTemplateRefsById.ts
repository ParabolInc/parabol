import {MaybeReadonly} from 'parabol-client/types/generics'
import getPg from '../getPg'
import {
  getTemplateRefsByIdQuery,
  IGetTemplateRefsByIdQueryResult
} from './generated/getTemplateRefsByIdQuery'

export interface TemplateRef extends IGetTemplateRefsByIdQueryResult {
  dimensions: {
    name: string
    scaleRefId: string
  }[]
}

const getTemplateRefsById = async (refIds: MaybeReadonly<string[]>) => {
  const templateRefs = await getTemplateRefsByIdQuery.run({refIds} as any, getPg())
  return templateRefs as TemplateRef[]
}
export default getTemplateRefsById

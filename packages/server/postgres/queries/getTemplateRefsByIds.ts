import {MaybeReadonly} from 'parabol-client/types/generics'
import getPg from '../getPg'
import {
  getTemplateRefsByIdsQuery,
  IGetTemplateRefsByIdsQueryResult
} from './generated/getTemplateRefsByIdsQuery'

export interface TemplateRef extends IGetTemplateRefsByIdsQueryResult {
  dimensions: {
    name: string
    scaleRefId: string
  }[]
}

const getTemplateRefsById = async (ids: MaybeReadonly<string[]>) => {
  const templateRefs = await getTemplateRefsByIdsQuery.run({ids} as any, getPg())
  return templateRefs as TemplateRef[]
}
export default getTemplateRefsById

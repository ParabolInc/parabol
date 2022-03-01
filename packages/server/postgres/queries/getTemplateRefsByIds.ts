import {MaybeReadonly} from 'parabol-client/types/generics'
import getPg from '../getPg'
import {
  getTemplateRefsByIdsQuery,
  IGetTemplateRefsByIdsQueryResult
} from './generated/getTemplateRefsByIdsQuery'

interface TemplateRefDimension {
  name: string
  scaleRefId: string
}
export interface TemplateRef extends Omit<IGetTemplateRefsByIdsQueryResult, 'dimensions'> {
  dimensions: [TemplateRefDimension, ...TemplateRefDimension[]]
}

const getTemplateRefsById = async (ids: MaybeReadonly<string[]>) => {
  const templateRefs = await getTemplateRefsByIdsQuery.run({ids} as any, getPg())
  return templateRefs as unknown as TemplateRef[]
}
export default getTemplateRefsById

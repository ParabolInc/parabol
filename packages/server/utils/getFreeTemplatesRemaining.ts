import type {DataLoaderWorker} from '../graphql/graphql'

export const FREE_TEMPLATE_COLUMNS = {
  retrospective: 'freeCustomRetroTemplatesRemaining',
  poker: 'freeCustomPokerTemplatesRemaining',
  teamPrompt: 'freeCustomStandupTemplatesRemaining'
} as const

export type FreeTemplateType = keyof typeof FREE_TEMPLATE_COLUMNS

export const DEFAULT_FREE_TEMPLATES = 2

const getFreeTemplatesRemaining = async (
  userId: string,
  templateType: FreeTemplateType,
  dataLoader: DataLoaderWorker
) => {
  const userDetail = await dataLoader.get('userDetails').load(userId)
  return userDetail?.[FREE_TEMPLATE_COLUMNS[templateType]] ?? DEFAULT_FREE_TEMPLATES
}

export default getFreeTemplatesRemaining

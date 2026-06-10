import type {DataLoaderInstance} from 'parabol-server/dataloader/RootDataLoader'
import {inferLanguage} from '../inferLanguage'

export const createTextFromRetroReflection = async (
  refId: string,
  dataLoader: DataLoaderInstance
) => {
  const reflection = await dataLoader.get('retroReflections').load(refId)
  if (!reflection) throw new Error(`RetroReflection not found: ${refId}`)
  const {plaintextContent} = reflection
  const language = inferLanguage(plaintextContent)
  return {body: plaintextContent, language}
}

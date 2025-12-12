import type {DataLoaderInstance} from '../../server/dataloader/RootDataLoader'

export const createTextFromPage = async (pageId: number, dataLoader: DataLoaderInstance) => {
  const page = await dataLoader.get('pagesWithContent').load(pageId)

  if (!page) throw new Error(`Page ${pageId} not found`)

  const {plaintextContent} = page
  const parts = [plaintextContent].filter(Boolean)

  return {
    body: parts.join('\n'),
    language: 'en' // Default to english for now
  }
}

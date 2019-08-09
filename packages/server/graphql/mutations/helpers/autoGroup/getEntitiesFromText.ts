import language from '@google-cloud/language/src/index'

interface GoogleAnalyzeEntitiesItem {
  entities: {
    name: string
    salience: number // 0 - 1
  }[]
}

export type GoogleAnalyzeEntitiesResponse = GoogleAnalyzeEntitiesItem[] | null

const getEntitiesFromText = async (content): Promise<GoogleAnalyzeEntitiesResponse> => {
  const client = new language.LanguageServiceClient()
  const document = {
    content,
    type: 'PLAIN_TEXT'
  }
  return client.analyzeEntities({document})
}

export default getEntitiesFromText

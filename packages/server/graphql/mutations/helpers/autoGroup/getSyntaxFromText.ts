import language from '@google-cloud/language/src/index'

export interface GoogleAnalyzedSyntaxItem {
  tokens: {
    lemma: string
    text: {
      content: string
    }
  }[]
}

export type GoogleAnalyzeSyntaxResponse = GoogleAnalyzedSyntaxItem[] | null

const getEntitiesFromText = async (content: string): Promise<GoogleAnalyzeSyntaxResponse> => {
  const client = new language.LanguageServiceClient()
  const document = {
    content,
    type: 'PLAIN_TEXT'
  }
  return client.analyzeSyntax({document})
}

export default getEntitiesFromText

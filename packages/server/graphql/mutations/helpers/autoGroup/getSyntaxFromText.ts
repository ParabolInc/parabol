import language from '@google-cloud/language/src/index'

const getEntitiesFromText = async (contextText) => {
  const client = new language.LanguageServiceClient()
  const document = {
    content: contextText,
    type: 'PLAIN_TEXT'
  }
  return client.analyzeSyntax({document})
}

export default getEntitiesFromText

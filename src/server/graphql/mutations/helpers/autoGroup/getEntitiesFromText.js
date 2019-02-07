import language from '@google-cloud/language/src/index'
import sendToSentry from 'server/utils/sendToSentry'

const getEntitiesFromText = async (contextText) => {
  let client
  // google writes this so horribly wrong that we can't actually catch an error from here, but I write it like this in hopes they change
  try {
    client = new language.LanguageServiceClient()
  } catch (e) {
    sendToSentry(e)
    return null
  }
  const document = {
    content: contextText,
    type: 'PLAIN_TEXT'
  }
  try {
    return client.analyzeEntities({document})
  } catch (e) {
    sendToSentry(e)
    return null
  }
}

export default getEntitiesFromText

import getGoogleLanguageManager from '../../../getGoogleLanguageManager'
import manageGoogleNLPErrorResponse from './manageGoogleNLPErrorResponse'

const getReflectionSentimentScore = async (question: string, response: string) => {
  if (!response) return undefined
  const manager = getGoogleLanguageManager()
  const document = `${question}: ${response}`
  const res = await manager.analyzeSentiment(document)
  const reflectionSentiment = manageGoogleNLPErrorResponse(res)
  return reflectionSentiment?.documentSentiment.score
}

export default getReflectionSentimentScore

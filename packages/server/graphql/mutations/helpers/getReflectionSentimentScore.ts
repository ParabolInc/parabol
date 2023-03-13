import getGoogleLanguageManager from '../../../getGoogleLanguageManager'
import manageGoogleNLPErrorResponse from './manageGoogleNLPErrorResponse'

const getReflectionSentimentScore = async (plaintextContent: string) => {
  if (!plaintextContent) return undefined
  const manager = getGoogleLanguageManager()
  const res = await manager.analyzeSentiment(plaintextContent)
  const reflectionSentiment = manageGoogleNLPErrorResponse(res)
  return reflectionSentiment?.documentSentiment.score ?? undefined
}

export default getReflectionSentimentScore

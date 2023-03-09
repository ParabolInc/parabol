import getGoogleLanguageManager from '../../../getGoogleLanguageManager'
import manageGoogleNLPErrorResponse from './manageGoogleNLPErrorResponse'

const getReflectionSentimentScore = async (plaintextContent: string) => {
  if (!plaintextContent) return 0.0
  const manager = getGoogleLanguageManager()
  const res = await manager.analyzeSentiment(plaintextContent)
  const reflectionSentiment = manageGoogleNLPErrorResponse(res)
  return reflectionSentiment?.documentSentiment.score ?? 0.0
}

export default getReflectionSentimentScore

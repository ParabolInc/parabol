import type {HttpResponse} from 'uWebSockets.js'

const openAIAppsChallengeHandler = (res: HttpResponse) => {
  const token = process.env.OPENAI_APPS_CHALLENGE
  res.writeStatus(token ? '200 OK' : '404 Not Found')
  res.writeHeader('Content-Type', 'text/plain; charset=utf-8')
  res.end(token ?? '')
}

export default openAIAppsChallengeHandler

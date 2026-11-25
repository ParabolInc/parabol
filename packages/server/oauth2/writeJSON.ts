import type {HttpResponse} from 'uWebSockets.js'

const writeJSON = (res: HttpResponse, status: string, body: Record<string, unknown>) => {
  res.writeStatus(status)
  res.writeHeader('Access-Control-Allow-Origin', '*')
  res.writeHeader('Content-Type', 'application/json')
  res.writeHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

export default writeJSON

import type {HttpResponse} from 'uWebSockets.js'

const writeMetadata = (res: HttpResponse, metadata: Record<string, unknown>) => {
  res.writeStatus('200 OK')
  res.writeHeader('Access-Control-Allow-Origin', '*')
  res.writeHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(metadata))
}

export default writeMetadata

import base64url from 'base64url'
import crypto from 'crypto'
import fs from 'fs'
import http, {RequestListener} from 'http'
import path from 'path'

const queryMap = {}
const makeHash = (text: string) => {
  const hasher = crypto.createHash('md5')
  hasher.update(text)
  const unsafeId = hasher.digest('base64')
  const safeId = base64url.fromBase64(unsafeId)
  const prefix = text[0]
  const id = `${prefix}_${safeId}`
  return id
}

const requestListener: RequestListener = async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(400)
    res.end('Request is not supported.')
    return
  }
  if (req.headers['content-type'] !== 'application/x-www-form-urlencoded') {
    res.writeHead(400)
    res.end('Only application/x-www-form-urlencoded')
    return
  }
  const buffers: Buffer[] = []
  for await (const chunk of req) {
    buffers.push(chunk)
  }
  const data = Buffer.concat(buffers).toString()
  const text = new URLSearchParams(data).get('text')
  if (!text) {
    res.writeHead(400)
    res.end('Expected to have `text` parameter in the POST.')
    return
  }
  const id = makeHash(text)
  queryMap[id] = text
  fs.writeFileSync(path.join(__dirname, './queryMap.json'), JSON.stringify(queryMap))
  res.writeHead(200, {
    'Content-Type': 'application/json'
  })
  res.end(JSON.stringify({id}))
}

const PORT = 2999
const server = http.createServer(requestListener)
server.listen(PORT)

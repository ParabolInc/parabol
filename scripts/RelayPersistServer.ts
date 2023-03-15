import base64url from 'base64url'
import crypto from 'crypto'
import fs from 'fs'
import http, {RequestListener, Server} from 'http'
import path from 'path'
import config from '../relay.config'

export default class RelayPersistServer {
  server: Server
  queryMapPath = path.join(__dirname, '../queryMap.json')
  queryMap: Record<string, string>
  constructor(port = 2999) {
    this.server = http.createServer(this.requestListener)
    this.server.listen(port)
    this.prepareArtifactDirectory()
    try {
      this.queryMap = JSON.parse(fs.readFileSync(this.queryMapPath, 'utf-8'))
    } catch {
      this.queryMap = {}
    }
  }

  close() {
    this.server.close()
  }
  makeHash(text: string) {
    const hasher = crypto.createHash('md5')
    hasher.update(text)
    const unsafeId = hasher.digest('base64')
    const safeId = base64url.fromBase64(unsafeId)
    const prefix = text[0]
    const id = `${prefix}_${safeId}`
    return id
  }

  requestListener: RequestListener = async (req, res) => {
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
    const id = this.makeHash(text)
    this.queryMap[id] = text.replace(/\n|\r/g, '').replace(/\s{2,}/g, ' ')
    fs.writeFileSync(this.queryMapPath, JSON.stringify(this.queryMap))
    res.writeHead(200, {
      'Content-Type': 'application/json'
    })
    res.end(JSON.stringify({id}))
  }
  prepareArtifactDirectory() {
    const {artifactDirectory} = config
    if (!fs.existsSync(artifactDirectory)) {
      fs.mkdirSync(artifactDirectory)
    }
  }
}

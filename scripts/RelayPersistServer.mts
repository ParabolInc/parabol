import crypto from 'crypto'
import fs from 'fs'
import http, {type RequestListener, type Server} from 'http'
import type {AddressInfo} from 'net'
import path from 'path'
import clientConfig from '../relay.config.js'

const BATCH_WINDOW_MS = 10

export default class RelayPersistServer {
  server: Server
  ready: Promise<void>
  port = 0
  queryMapPath = path.join(import.meta.dirname, '../queryMap.json')
  queryMap: Record<string, string>
  batch: Promise<void> | undefined
  // The OS picks the port, so 2 checkouts can never persist into each other's queryMap
  // Whoever starts the relay compiler passes the port along as RELAY_PERSIST_PORT, which relay.config.js reads
  constructor() {
    this.server = http.createServer(this.requestListener)
    this.ready = new Promise<void>((resolve, reject) => {
      this.server.listen(0, () => {
        this.port = (this.server.address() as AddressInfo).port
        resolve()
      })
      this.server.on('error', reject)
    })
    const queryMap = this.readQueryMap()
    // If queryMap doesn't exist, make sure artifacts doesn't either so it isn't missing any
    this.prepareArtifactDirectory(!queryMap)
    this.queryMap = queryMap ?? {}
  }

  close() {
    this.server.close()
  }
  makeHash(text: string) {
    const safeId = crypto.createHash('md5').update(text).digest('base64url')
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
    const query = text
      .replace(/\n|\r/g, '')
      .replace(/\s{2,}/g, ' ')
      // biome-ignore lint/suspicious/noControlCharactersInRegex: disallow null char
      .replace(/\u0000/g, '')
    if (this.queryMap[id] !== query) {
      this.queryMap[id] = query
      // relay only writes the artifact after it gets the id, so by then the query is on disk for the server to find
      await this.writeBatch()
    }
    res.writeHead(200, {
      'Content-Type': 'application/json'
    })
    res.end(JSON.stringify({id}))
  }
  // relay persists a burst of queries concurrently. They share 1 write instead of rewriting the whole map for each query
  writeBatch() {
    if (!this.batch) {
      this.batch = new Promise<void>((resolve) => {
        setTimeout(() => {
          this.batch = undefined
          this.writeQueryMap()
          resolve()
        }, BATCH_WINDOW_MS)
      })
    }
    return this.batch
  }
  readQueryMap() {
    try {
      return JSON.parse(fs.readFileSync(this.queryMapPath, 'utf-8')) as Record<string, string>
    } catch {
      return null
    }
  }
  // write via a temp file + rename so a reader (or a kill mid-write) never sees a truncated map.
  // a corrupt map makes the next boot flush the whole artifact directory & recompile from scratch
  writeQueryMap() {
    // another compile of this checkout (e.g. the postcheckout hook) may have persisted queries since the map was read
    this.queryMap = {...this.readQueryMap(), ...this.queryMap}
    const tmpPath = `${this.queryMapPath}.${process.pid}.tmp`
    fs.writeFileSync(tmpPath, JSON.stringify(this.queryMap))
    fs.renameSync(tmpPath, this.queryMapPath)
  }
  prepareArtifactDirectory(flushArtifacts: boolean) {
    const prepare = (config: {artifactDirectory: string}) => {
      const {artifactDirectory} = config
      if (flushArtifacts) fs.rmSync(artifactDirectory, {recursive: true, force: true})
      if (!fs.existsSync(artifactDirectory)) {
        fs.mkdirSync(artifactDirectory)
      }
    }
    prepare(clientConfig)
  }
}

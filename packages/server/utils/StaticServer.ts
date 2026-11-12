import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import crypto from 'crypto'
import fs from 'fs'
import mime from 'mime-types'
import path from 'path'
import {brotliCompressSync} from 'zlib'
import {acceptsEncoding} from '../acceptsBrotli'
import pipeStreamOverResponse from '../pipeStreamOverResponse'
import isCompressible from './isCompressible'
import isContentHashed from './isContentHashed'

// A file up to this size is kept in memory once it is read, & the least recently sent go first.
// The brotli versions of the whole client fit, so a client that accepts brotli never waits on the disk
const MAX_CACHED_FILE_BYTES = 1024 * 1024
const MAX_CACHE_BYTES = 16 * 1024 * 1024

export interface StaticFile {
  type: string
  cacheControl: string
  etag: string
  size: number
  // the content is held in memory or read from the disk
  body?: Buffer
  pathname?: string
  // brotli versions are made at build time, or when a file made in memory is first sent
  brBody?: Buffer
  brPathname?: string
  brSize?: number
  headers?: Record<string, string>
}

// uWS frees the request at the first await, so a response reads what it needs first
export interface StaticRequest {
  acceptEncoding: string
  ifNoneMatch: string
  range: string
  ifRange: string
}

export interface StaticRoot {
  dirname: string
  // a file's name is its path under dirname, after the prefix
  prefix?: string
  exclude?: (name: string) => boolean
}

type ByteRange = {start: number; end: number}
type Headers = [string, string][]

export class ByteLRU {
  private entries = new Map<string, Buffer>()
  private bytes = 0
  constructor(private maxBytes: number) {}
  get size() {
    return this.bytes
  }
  get(key: string) {
    const value = this.entries.get(key)
    if (value) {
      // a Map iterates in insertion order, so the least recently used is first
      this.entries.delete(key)
      this.entries.set(key, value)
    }
    return value
  }
  set(key: string, value: Buffer) {
    if (value.length > this.maxBytes) return
    const existing = this.entries.get(key)
    if (existing) {
      this.entries.delete(key)
      this.bytes -= existing.length
    }
    this.entries.set(key, value)
    this.bytes += value.length
    for (const [oldestKey, oldest] of this.entries) {
      if (this.bytes <= this.maxBytes) break
      this.entries.delete(oldestKey)
      this.bytes -= oldest.length
    }
  }
}

const cache = new ByteLRU(MAX_CACHE_BYTES)
const reads = new Map<string, Promise<Buffer>>()

export const readStaticRequest = (req: HttpRequest): StaticRequest => ({
  acceptEncoding: req.getHeader('accept-encoding'),
  ifNoneMatch: req.getHeader('if-none-match'),
  range: req.getHeader('range'),
  ifRange: req.getHeader('if-range')
})

export const getContentType = (pathname: string) =>
  mime.contentType(path.extname(pathname)) || 'application/octet-stream'

const getCacheControl = (name: string) =>
  isContentHashed(name) ? 'public, max-age=31536000, immutable' : 'no-cache'

// Weak, because the same tag stands for the file as it is & with brotli
export const makeDiskETag = ({size, mtimeMs}: fs.Stats) =>
  `W/"${size.toString(16)}-${Math.floor(mtimeMs).toString(16)}"`

const makeContentETag = (body: Buffer) =>
  `W/"${crypto.createHash('sha1').update(body).digest('base64url')}"`

export const matchesETag = (ifNoneMatch: string, etag: string) => {
  if (!ifNoneMatch) return false
  if (ifNoneMatch.trim() === '*') return true
  const opaqueTag = etag.replace(/^W\//, '')
  return ifNoneMatch.split(',').some((tag) => tag.trim().replace(/^W\//, '') === opaqueTag)
}

// Only a single range is sent as a range. Anything else gets the whole file, which HTTP allows
export const parseRange = (
  range: string,
  size: number
): ByteRange | 'unsatisfiable' | undefined => {
  const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim())
  if (!match) return undefined
  const [, first = '', last = ''] = match
  if (!first && !last) return undefined
  if (!first) {
    const suffixLength = Number(last)
    if (suffixLength === 0 || size === 0) return 'unsatisfiable'
    return {start: Math.max(0, size - suffixLength), end: size - 1}
  }
  const start = Number(first)
  if (last && Number(last) < start) return undefined
  if (start >= size) return 'unsatisfiable'
  return {start, end: last ? Math.min(Number(last), size - 1) : size - 1}
}

const slice = (body: Buffer, range: ByteRange | undefined) =>
  range ? body.subarray(range.start, range.end + 1) : body

const writeHead = (res: HttpResponse, status: string, headers: Headers) => {
  res.writeStatus(status)
  headers.forEach(([key, value]) => res.writeHeader(key, value))
}

const end = (res: HttpResponse, status: string, headers: Headers, body?: Buffer) => {
  if (res.aborted) return
  res.cork(() => {
    writeHead(res, status, headers)
    // a 304 has no body, & its headers describe the body the client already has
    if (body) res.end(body)
    else res.endWithoutBody()
  })
}

export const sendStatus = (res: HttpResponse, status: string, headers: Headers = []) => {
  if (res.aborted) return
  res.cork(() => {
    writeHead(res, status, headers)
    res.end()
  })
}

const fail = (res: HttpResponse, error: NodeJS.ErrnoException) => {
  sendStatus(res, error.code === 'ENOENT' ? '404 Not Found' : '500 Internal Server Error')
}

const sendFromDisk = (
  res: HttpResponse,
  status: string,
  headers: Headers,
  file: {pathname: string; etag: string; size: number},
  range: ByteRange | undefined
) => {
  const {pathname, etag, size} = file
  // keyed by the tag, too, so a replaced self-hosted upload is never sent stale
  const key = `${etag} ${pathname}`
  const cached = cache.get(key)
  if (cached) {
    end(res, status, headers, slice(cached, range))
    return
  }
  if (size <= MAX_CACHED_FILE_BYTES) {
    res.onAborted(() => {
      res.aborted = true
    })
    let read = reads.get(key)
    if (!read) {
      // concurrent requests for a file share 1 read
      read = fs.promises.readFile(pathname)
      reads.set(key, read)
      read
        .then(
          (body) => cache.set(key, body),
          () => {}
        )
        .finally(() => reads.delete(key))
    }
    read.then(
      (body) => end(res, status, headers, slice(body, range)),
      (error) => fail(res, error)
    )
    return
  }
  // a large file, like meeting music, is streamed & never held in memory
  const start = range?.start ?? 0
  const last = range?.end ?? size - 1
  if (res.aborted) return
  res.cork(() => writeHead(res, status, headers))
  pipeStreamOverResponse(res, fs.createReadStream(pathname, {start, end: last}), last - start + 1)
}

export const sendStaticFile = (res: HttpResponse, request: StaticRequest, file: StaticFile) => {
  const hasBrotli = !!(file.brBody || file.brPathname)
  const headers: Headers = [
    ['Cache-Control', file.cacheControl],
    ['ETag', file.etag],
    ['X-Content-Type-Options', 'nosniff'],
    ...Object.entries(file.headers ?? {})
  ]
  // a shared cache must not send brotli to a client that didn't ask for it
  if (hasBrotli) headers.push(['Vary', 'Accept-Encoding'])
  if (matchesETag(request.ifNoneMatch, file.etag)) {
    end(res, '304 Not Modified', headers)
    return
  }
  // If-Range needs a strong tag & these are weak, so a conditional range request gets the whole file
  const range = request.range && !request.ifRange ? parseRange(request.range, file.size) : undefined
  if (range === 'unsatisfiable') {
    sendStatus(res, '416 Range Not Satisfiable', [['Content-Range', `bytes */${file.size}`]])
    return
  }
  headers.push(['Content-Type', file.type], ['Accept-Ranges', 'bytes'])
  // a range is a range of the file as it is, so it never gets brotli
  const useBrotli = hasBrotli && !range && acceptsEncoding(request.acceptEncoding, 'br')
  if (useBrotli) headers.push(['Content-Encoding', 'br'])
  if (range) headers.push(['Content-Range', `bytes ${range.start}-${range.end}/${file.size}`])
  const status = range ? '206 Partial Content' : '200 OK'
  const body = useBrotli ? file.brBody : file.body
  if (body) {
    end(res, status, headers, slice(body, range))
    return
  }
  const pathname = useBrotli ? file.brPathname : file.pathname
  const size = useBrotli ? file.brSize : file.size
  if (!pathname || size === undefined) {
    sendStatus(res, '500 Internal Server Error')
    return
  }
  sendFromDisk(res, status, headers, {pathname, etag: file.etag, size}, range)
}

const makeMemoryFile = (name: string, content: string): StaticFile => {
  const body = Buffer.from(content)
  let brBody: Buffer | undefined
  return {
    type: getContentType(name),
    cacheControl: getCacheControl(name),
    etag: makeContentETag(body),
    size: body.length,
    body,
    // made when the file is first sent, so a server starts without compressing files it may never send.
    // These are a few KB, so the best compression takes milliseconds, once
    get brBody() {
      if (!isCompressible(name)) return undefined
      brBody ??= brotliCompressSync(body)
      return brBody
    }
  }
}

const listFiles = (dirname: string, prefix: string, pathnames: Map<string, string>) => {
  fs.readdirSync(dirname, {withFileTypes: true}).forEach((dirent) => {
    // a symlink is neither, so it is never followed
    const pathname = path.join(dirname, dirent.name)
    if (dirent.isFile()) {
      pathnames.set(prefix + dirent.name, pathname)
    } else if (dirent.isDirectory()) {
      listFiles(pathname, `${prefix}${dirent.name}/`, pathnames)
    }
  })
}

// The files are listed when the server starts. A request is looked up by name in that list,
// so it can only ever reach a file that was put there, whatever the path holds
export default class StaticServer {
  private files = new Map<string, StaticFile>()
  constructor(options: {roots: StaticRoot[]; files?: Record<string, string>}) {
    const {roots, files = {}} = options
    roots.forEach((root) => this.addRoot(root))
    Object.entries(files).forEach(([name, content]) => {
      this.files.set(name, makeMemoryFile(name, content))
    })
  }
  private addRoot({dirname, prefix = '', exclude}: StaticRoot) {
    if (!fs.existsSync(dirname)) return
    const pathnames = new Map<string, string>()
    listFiles(dirname, prefix, pathnames)
    pathnames.forEach((pathname, name) => {
      // a .br file is sent in place of the file it compresses, never by its own name
      if (name.endsWith('.br') || exclude?.(name)) return
      const brPathname = pathnames.get(`${name}.br`)
      const stats = fs.statSync(pathname)
      this.files.set(name, {
        type: getContentType(name),
        cacheControl: getCacheControl(name),
        etag: makeDiskETag(stats),
        size: stats.size,
        pathname,
        brPathname,
        brSize: brPathname ? fs.statSync(brPathname).size : undefined
      })
    })
  }
  get(name: string) {
    return this.files.get(name)
  }
}

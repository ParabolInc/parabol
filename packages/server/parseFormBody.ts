import {HttpResponse, HttpRequest} from 'uWebSockets.js'
import Busboy from 'busboy'
import {Readable} from 'stream'
import fs from 'fs'

const bodyStream = (res: HttpResponse) => {
  const stream = new Readable()
  stream._read = () => 'no-op'
  res.onData((ab, isLast) => {
    const curBuf = Buffer.from(ab)
    stream.push(new Uint8Array(curBuf.slice(curBuf.byteOffset, curBuf.byteLength)))
    if (isLast) stream.push(null)
  })
  return stream
}

const reqHeaders = (req: HttpRequest) => {
  const headers = {} as {[key: string]: string}
  req.forEach((k, v) => (headers[k] = v))
  return headers
}

const parseFormBody = (res: HttpResponse, req: HttpRequest) => {
  // todo: better typing, validation, etc.
  return new Promise<[any, any]>((resolve) => {
    let foundFile, foundBody
    const busboy = new Busboy({headers: reqHeaders(req)})
    bodyStream(res).pipe(busboy)
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      console.log('file found!!')
      console.log('file args:', fieldname, filename, encoding, mimetype)
      console.log('file:', file)
      file.pipe(fs.createWriteStream('./upload.jpg'))
      foundFile = file
    })
    busboy.on('field', async (fieldname, val) => {
      if (fieldname !== 'body') return
      const body = await JSON.parse(val)
      foundBody = body
      console.log('body:', body)
    })
    busboy.on('finish', () => {
      console.log('busboy finished!')
      resolve([foundFile, foundBody])
    })
  })
}

export default parseFormBody

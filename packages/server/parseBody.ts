import {HttpResponse} from 'uWebSockets.js'
import fs from 'fs'

const defaultParser = (buffer: Buffer) => JSON.parse(buffer.toString())

const parseBody = (res: HttpResponse, parser = defaultParser) => {
  return new Promise<JSON | null>((resolve) => {
    let buffer: Buffer
    res.onData((ab, isLast) => {
      const curBuf = Buffer.from(ab)
      buffer = buffer ? Buffer.concat([buffer, curBuf]) : isLast ? curBuf : Buffer.concat([curBuf])
      // const writeStream = fs.createWriteStream('./upload.jpg')
      // fs.createReadStream(curBuf)
      // console.log('writestream:', writeStream)
      // writeStream.write('test')
      // console.log('buffer:', curBuf)
      if (isLast) {
        fs.writeFile('upload.jpg', buffer, (err) => console.log('err:', err))
        console.log('whole buffer:', buffer)
        try {
          resolve(parser(buffer))
        } catch (e) {
          resolve(null)
        }
      }
    })
  })
}

export default parseBody

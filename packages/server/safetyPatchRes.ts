import {HttpResponse, RecognizedString} from 'uWebSockets.js'

const safetyPatchRes = (res: HttpResponse) => {
  if (res._end) {
    throw new Error('already patched')
  }
  res.onAborted(() => {
    res.done = true
    if (res.abortEvents) {
      res.abortEvents.forEach((f) => f())
    }
  })

  res.onAborted = (handler) => {
    res.abortEvents = res.abortEvents || []
    res.abortEvents.push(handler)
    return res
  }

  res._end = res.end
  res.end = (body?: RecognizedString) => {
    if (res.done) {
      console.log(`uWS DEBUG: Called end after done`)
      return res
    }
    res.done = true
    return res._end(body)
  }

  res._close = res.close
  res.close = () => {
    if (res.done) {
      console.log(`uWS DEBUG: Called close after done`)
      return res
    }
    res.done = true
    return res._close()
  }

  res._cork = res.cork
  res.cork = (cb: () => void) => {
    if (res.done) {
      console.log(`uWS DEBUG: Called cork after done`)
      return
    }
    res._cork(cb)
  }

  res._tryEnd = res.tryEnd
  res.tryEnd = (fullBodyOrChunk: RecognizedString, totalSize: number) => {
    if (res.done) {
      console.log(`uWS DEBUG: Called tryEnd after done`)
      return [true, true]
    }
    return res._tryEnd(fullBodyOrChunk, totalSize)
  }

  res._write = res.write
  res.write = (chunk: RecognizedString) => {
    if (res.done) {
      console.log(`uWS DEBUG: Called write after done`)
      return res
    }
    return res._write(chunk)
  }

  res._writeHeader = res.writeHeader
  res.writeHeader = (key: RecognizedString, value: RecognizedString) => {
    if (res.done) {
      console.log(`uWS DEBUG: Called writeHeader after done ${key}`)
      return res
    }
    return res._writeHeader(key, value)
  }

  res._writeStatus = res.writeStatus
  res.writeStatus = (status: RecognizedString) => {
    if (res.done) {
      console.error(`uWS DEBUG: Called writeStatus after done ${status}`)
      return res
    }
    return res._writeStatus(status)
  }
}

export default safetyPatchRes

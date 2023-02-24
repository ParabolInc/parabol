import {HttpResponse, RecognizedString} from 'uWebSockets.js'

const safetyPatchRes = (res: HttpResponse) => {
  if (res._end) {
    throw new Error('already patched')
  }
  res.onAborted(() => {
    res.aborted = true
    if (res.abortEvents) {
      res.abortEvents.forEach((f: () => void) => f())
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
      console.warn(`uWS: Called end after done`)
    }
    if (res.done || res.aborted) return res
    res.done = true
    return res._end(body)
  }

  res._close = res.close
  res.close = () => {
    if (res.done) {
      console.warn(`uWS: Called close after done`)
    }
    if (res.done || res.aborted) return res
    res.done = true
    return res._close()
  }

  res._cork = res.cork
  res.cork = (cb: () => void) => {
    if (res.done) {
      console.warn(`uWS: Called cork after done`)
    }
    if (res.done || res.aborted) return res
    return res._cork(cb)
  }

  res._tryEnd = res.tryEnd
  res.tryEnd = (fullBodyOrChunk: RecognizedString, totalSize: number) => {
    if (res.done) {
      console.warn(`uWS: Called tryEnd after done`)
    }
    if (res.done || res.aborted) return [true, true]
    return res._tryEnd(fullBodyOrChunk, totalSize)
  }

  res._write = res.write
  res.write = (chunk: RecognizedString) => {
    if (res.done) {
      console.warn(`uWS: Called write after done`)
    }
    if (res.done || res.aborted) return res
    return res._write(chunk)
  }

  res._writeHeader = res.writeHeader
  res.writeHeader = (key: RecognizedString, value: RecognizedString) => {
    if (res.done) {
      console.warn(`uWS: Called writeHeader after done`)
    }
    if (res.done || res.aborted) return res
    return res._writeHeader(key, value)
  }

  res._writeStatus = res.writeStatus
  res.writeStatus = (status: RecognizedString) => {
    if (res.done) {
      console.error(`uWS: Called writeStatus after done ${status}`)
    }
    if (res.done || res.aborted) return res
    return res._writeStatus(status)
  }

  res._upgrade = res.upgrade
  res.upgrade = (...args) => {
    if (res.done) {
      console.error(`uWS: Called upgrade after done`)
    }
    if (res.done || res.aborted) return
    return res._upgrade(...args)
  }

  res._getRemoteAddressAsText = res.getRemoteAddressAsText
  res.getRemoteAddressAsText = () => {
    if (res.done) {
      console.error(`uWS: Called upgrade after done`)
    }
    if (res.done || res.aborted) return Buffer.from('')
    return res._getRemoteAddressAsText()
  }
}

export default safetyPatchRes

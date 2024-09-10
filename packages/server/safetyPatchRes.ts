import {HttpResponse, RecognizedString} from 'uWebSockets.js'
import {Logger} from './utils/Logger'

type Header = [key: RecognizedString, value: RecognizedString]

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

  // Cache writes until `.end()` gets called. Then flush
  res.status = ''
  res.headers = [] as Header[]

  const flush = <T>(thunk: () => T) => {
    return res._cork(() => {
      if (res.status) res._writeStatus(res.status)
      res.headers.forEach((header: Header) => {
        res._writeHeader(...header)
      })
      return thunk()
    })
  }

  res._end = res.end
  res.end = (body?: RecognizedString) => {
    if (res.done) {
      Logger.warn(`uWS: Called end after done`)
    }
    if (res.done || res.aborted) return res
    res.done = true
    return flush(() => res._end(body))
  }

  res._close = res.close
  res.close = () => {
    if (res.done) {
      Logger.warn(`uWS: Called close after done`)
    }
    if (res.done || res.aborted) return res
    res.done = true
    return res._close()
  }

  res._cork = res.cork
  res.cork = () => {
    throw new Error('safetyPatchRes applies the cork for you, do not call directly')
  }

  res._tryEnd = res.tryEnd
  res.tryEnd = (fullBodyOrChunk: RecognizedString, totalSize: number) => {
    if (res.done) {
      Logger.warn(`uWS: Called tryEnd after done`)
    }
    if (res.done || res.aborted) return [true, true]
    return flush(() => res._tryEnd(fullBodyOrChunk, totalSize))
  }

  res._write = res.write
  res.write = (chunk: RecognizedString) => {
    if (res.done) {
      Logger.warn(`uWS: Called write after done`)
    }
    if (res.done || res.aborted) return res
    return res._write(chunk)
  }

  res._writeHeader = res.writeHeader
  res.writeHeader = (key: RecognizedString, value: RecognizedString) => {
    if (res.done) {
      Logger.warn(`uWS: Called writeHeader after done`)
    }
    res.headers.push([key, value])
    return res
  }

  res._writeStatus = res.writeStatus
  res.writeStatus = (status: RecognizedString) => {
    if (res.done) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      Logger.error(`uWS: Called writeStatus after done ${status}`)
    }
    res.status = status
    return res
  }

  res._upgrade = res.upgrade
  res.upgrade = (...args) => {
    if (res.done) {
      Logger.error(`uWS: Called upgrade after done`)
    }
    if (res.done || res.aborted) return
    return res._cork(() => {
      res._upgrade(...args)
    })
  }

  res._getRemoteAddressAsText = res.getRemoteAddressAsText
  res.getRemoteAddressAsText = () => {
    if (res.done) {
      Logger.error(`uWS: Called getRemoteAddressAsText after done`)
    }
    if (res.done || res.aborted) return Buffer.from('')
    return res._getRemoteAddressAsText()
  }
}

export default safetyPatchRes

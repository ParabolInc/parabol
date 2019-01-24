import {Readable} from 'stream'

interface Streams {
  [name: string]: StreamDict
}

class StreamDict {
  stream?: Readable
  resolve?: (stream: Readable) => void
  promise?: Promise<Readable>
  // if a bad actor uploads a stream that'll never get used, we should dump it when we realize it's not getting used
  beginReadTimerId?: NodeJS.Timeout
  // if a GQL resolve function requests a stream, we should fail if it doesn't arrive soon-ish
  requestStreamTimerId?: NodeJS.Timeout
  size = 0
}

export default class UploadManager {
  static MAX_SIZE = 2 ** 22 // 4MB
  static noop = () => {
    /*OK*/
  }

  private handleBuffer (dict: StreamDict, buffer: Buffer, eof: boolean) {
    const stream = dict.stream!
    dict.size += buffer.byteLength
    if (dict.size > UploadManager.MAX_SIZE) {
      stream.push(null)
      console.log('client attempting to push too big a file')
      return
    }
    stream.push(buffer)
    if (eof) {
      stream.push(null)
    }
  }

  private _streams: Streams = {}

  getStream = async (name: string) => {
    const streamDict = this._streams[name]
    if (!streamDict) {
      const newDict = new StreamDict()
      this._streams[name] = newDict
      newDict.promise = new Promise((resolve, reject) => {
        newDict.resolve = resolve
        newDict.beginReadTimerId = setTimeout(() => {
          this.removeStream(name)
          reject()
        }, 5000)
      })
      return newDict.promise
    }
    const {requestStreamTimerId, stream, promise} = streamDict
    if (requestStreamTimerId) {
      clearTimeout(requestStreamTimerId)
      streamDict.requestStreamTimerId = undefined
    }
    if (stream) {
      streamDict.promise = undefined
      return stream
    }
    if (promise) return promise
    throw new Error('noop: Unhandled getStream')
  }

  pushBuffer = (name: string, buffer: Buffer, eof: boolean) => {
    const streamDict = this._streams[name]
    // const stream = streamDict ? continueStream(name, buffer, eof)streamDict.stream : startStream(name, buffer, eof)
    if (!streamDict) {
      // data came from the client before a gql resolver requested it
      // create a stream
      const newDict = new StreamDict()
      newDict.stream = new Readable({read: UploadManager.noop})
      this.handleBuffer(newDict, buffer, eof)
      // wait for a gql resolver to request the stream
      newDict.requestStreamTimerId = setTimeout(() => {
        // if no resolver wants the stream, dump it
        this.removeStream(name)
      }, 5000)
      this._streams[name] = newDict
    } else if (streamDict.stream) {
      // more data came from the client, still unsure if a gql resolver wants it
      this.handleBuffer(streamDict, buffer, eof)
    } else if (streamDict.resolve) {
      // a gql resolver requested this stream before it arrived
      if (streamDict.beginReadTimerId) {
        streamDict.beginReadTimerId = undefined
        clearTimeout(streamDict.beginReadTimerId)
      }
      // no need to return requestors a promise anymore
      streamDict.promise = undefined
      streamDict.stream = new Readable({read: UploadManager.noop})
      this.handleBuffer(streamDict, buffer, eof)
      streamDict.resolve(streamDict.stream)
    }
  }

  removeStream = (name) => {
    delete this._streams[name]
  }
}

import {HttpResponse} from 'uWebSockets.js'

const isHttpResponse = (transport: unknown): transport is HttpResponse => {
  return !!(transport as HttpResponse).tryEnd
}

export default isHttpResponse

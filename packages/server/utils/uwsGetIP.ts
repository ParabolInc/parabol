import {HttpResponse} from 'uWebSockets.js'

const uwsGetIP = (res: HttpResponse) => {
  // nginx will always returned the proxied address in the header, locally, we just grab the remote address
  return Buffer.from(res.getProxiedRemoteAddressAsText()).toString() || Buffer.from(res.getRemoteAddressAsText()).toString()
}

export default uwsGetIP

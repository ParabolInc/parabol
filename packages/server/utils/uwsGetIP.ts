import {HttpResponse} from 'uWebSockets.js'

const uwsGetIP = (res: HttpResponse) => {
  const proxiedRemoteAddressText = Buffer.from(res.getProxiedRemoteAddressAsText()).toString()
  const remoteAddressText = Buffer.from(res.getRemoteAddressAsText()).toString()
  const remoteAddress = Buffer.from(res.getRemoteAddress()).join('.')
  const proxiedRemoteAddress = Buffer.from(res.getProxiedRemoteAddress()).join('.')
  // return ipBuffer.byteLength === 16 ? ipBuffer.toString('hex') : ipBuffer.join('.')
  console.log({proxiedRemoteAddressText, remoteAddressText, remoteAddress, proxiedRemoteAddress})
  // const clientIp = req.getHeader('x-forwarded-for')
  // if (clientIp) return clientIp
  // nginx will always returned the proxied address in the header, locally, we just grab the remote address
  return Buffer.from(res.getProxiedRemoteAddressAsText()).toString() || Buffer.from(res.getRemoteAddressAsText()).toString()
}

export default uwsGetIP

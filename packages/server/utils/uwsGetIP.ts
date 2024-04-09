import {HttpRequest, HttpResponse} from 'uWebSockets.js'

const TRUSTED_PROXY_COUNT = Number(process.env.TRUSTED_PROXY_COUNT)
// if TRUSTED_PROXY_COUNT is not configured correctly we fall back to reading the first IP to avoid rate limiting our proxy
const CLIENT_IP_POS = isNaN(TRUSTED_PROXY_COUNT) ? 0 : -1 - TRUSTED_PROXY_COUNT

const uwsGetIP = (res: HttpResponse, req: HttpRequest) => {
  const clientIp = req.getHeader('x-forwarded-for')?.split(',').at(CLIENT_IP_POS)?.trim()
  if (clientIp) return clientIp
  // returns ipv6 e.g. '0000:0000:0000:0000:0000:ffff:ac11:0001'
  return Buffer.from(res.getRemoteAddressAsText()).toString()
}

export default uwsGetIP

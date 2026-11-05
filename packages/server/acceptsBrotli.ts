import type {HttpRequest} from 'uWebSockets.js'

// e.g. "gzip, deflate, br;q=0.8". A coding with q=0 is refused, and * stands for any coding not named
export const acceptsEncoding = (acceptEncoding: string, coding: string) => {
  let acceptsAny = false
  for (const entry of acceptEncoding.toLowerCase().split(',')) {
    const [name, ...params] = entry.split(';').map((part) => part.trim())
    const qParam = params.find((param) => param.startsWith('q='))
    const isAccepted = qParam ? Number(qParam.slice(2)) > 0 : true
    if (name === coding) return isAccepted
    if (name === '*') acceptsAny = isAccepted
  }
  return acceptsAny
}

const acceptsBrotli = (req: HttpRequest) => acceptsEncoding(req.getHeader('accept-encoding'), 'br')
export default acceptsBrotli

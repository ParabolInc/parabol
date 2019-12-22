import {HttpRequest} from 'uWebSockets.js'

const acceptsBrotli = (req: HttpRequest) => req.getHeader('accept-encoding').includes('br')
export default acceptsBrotli

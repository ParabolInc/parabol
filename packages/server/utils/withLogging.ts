import type {HttpRequest, HttpResponse} from 'uWebSockets.js'

export const withLogging = (
  name: string,
  handler: (res: HttpResponse, req: HttpRequest) => void
) => {
  return (res: HttpResponse, req: HttpRequest) => {
    const method = req.getMethod()
    const url = req.getUrl()
    const query = req.getQuery()
    const fullUrl = query ? `${url}?${query}` : url

    console.log(`[${name}] Request: ${method} ${fullUrl}`)
    console.log(`[${name}] Headers:`)
    req.forEach((key, value) => {
      console.log(`  ${key}: ${value}`)
    })

    // Monkey patch res.writeStatus and res.end to log response
    const originalWriteStatus = res.writeStatus
    const originalEnd = res.end

    let status = '200 OK' // Default if not called

    res.writeStatus = function (newStatus: string) {
      status = newStatus
      return originalWriteStatus.call(this, newStatus)
    }

    res.end = function (body?: any) {
      console.log(`[${name}] Response Status: ${status}`)
      if (body) {
        // Try to log body if it's a string or buffer
        try {
          const bodyStr = typeof body === 'string' ? body : Buffer.from(body).toString()
          // Truncate if too long
          const logBody = bodyStr.length > 1000 ? bodyStr.substring(0, 1000) + '...' : bodyStr
          console.log(`[${name}] Response Body: ${logBody}`)
        } catch (_e) {
          console.log(`[${name}] Response Body: [Binary or Unparseable]`)
        }
      }
      return originalEnd.call(this, body)
    }

    handler(res, req)
  }
}

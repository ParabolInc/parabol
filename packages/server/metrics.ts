import {collectDefaultMetrics, register} from 'prom-client'
import {HttpResponse} from 'uWebSockets.js'

// Enable default Node.js metrics
collectDefaultMetrics()

// Function to retrieve the metrics
export function getMetrics(): string {
  return register.metrics()
}

// Example function to handle HTTP request and send metrics
export function handleMetricsRequest(res: HttpResponse): void {
  try {
    res.writeHeader('Content-Type', register.contentType)
    res.end(getMetrics())
  } catch (error) {
    console.error('Error sending metrics:', error)
    res.writeHeader('Content-Type', 'text/plain')
    res.end('Error retrieving metrics')
  }
}

export default handleMetricsRequest

import {collectDefaultMetrics, register} from 'prom-client'
import {HttpResponse} from 'uWebSockets.js'

// Enable default Node.js metrics
collectDefaultMetrics()

// Function to retrieve the metrics
export async function getMetrics(): Promise<string> {
  return await register.metrics()
}

// Example function to handle HTTP request and send metrics
export async function handleMetricsRequest(res: HttpResponse): Promise<void> {
  try {
    res.writeHeader('Content-Type', String(register.contentType))
    res.end(await getMetrics())
  } catch (error) {
    console.error('Error sending metrics:', error)
    res.writeHeader('Content-Type', 'text/plain')
    res.end('Error retrieving metrics')
  }
}

export default handleMetricsRequest

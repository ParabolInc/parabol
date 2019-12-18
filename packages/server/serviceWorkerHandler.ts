import serveStatic from './utils/serveStatic'

const serviceWorkerHandler = (res) => {
  res.writeHeader('service-worker-allowed', '/')
  serveStatic(res, 'sw.ts')
}
export default serviceWorkerHandler

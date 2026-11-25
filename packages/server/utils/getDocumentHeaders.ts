// The consent page decides what an app may do, so no other site may frame it and steer a click
const UNFRAMEABLE_PATHS = ['/authorize-app']

const decodePath = (path: string) => {
  try {
    return decodeURIComponent(path)
  } catch {
    return path
  }
}

const getDocumentHeaders = (path: string): Record<string, string> => {
  // the client router opens a page under any case, escaping, or extra slashes
  const route = decodePath(path)
    .toLowerCase()
    .replace(/\/{2,}/g, '/')
    .replace(/\/$/, '')
  if (!UNFRAMEABLE_PATHS.includes(route)) return {}
  return {'Content-Security-Policy': "frame-ancestors 'none'", 'X-Frame-Options': 'DENY'}
}

export default getDocumentHeaders

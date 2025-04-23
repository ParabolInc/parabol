const proto = __PROTO__
const host = __HOST__
const port = __PORT__
const portSuffix = host !== 'localhost' ? '' : `:${port}`
export const parabolUrl = `${proto}://${host}${portSuffix}`


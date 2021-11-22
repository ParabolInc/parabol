export default function isObject(val: unknown) {
  return !!(val && typeof val === 'object')
}

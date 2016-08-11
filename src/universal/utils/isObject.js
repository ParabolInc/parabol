export default function isObject(val) {
  return val && typeof val === 'object' && !(val instanceof Date);
}

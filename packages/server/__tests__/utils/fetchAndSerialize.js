import fieldsToSerialize from './fieldsToSerialize'

const unsortables = new Set(['invitation'])
export default async function fetchAndSerialize (promiseObj, dynamicSerializer) {
  const keys = Object.keys(promiseObj)
  const values = Object.values(promiseObj)
  const docs = await Promise.all(values)
  const snapshot = {}
  for (let i = 0; i < docs.length; i++) {
    const key = keys[i]
    const doc = docs[i]
    if (!fieldsToSerialize[key]) {
      throw new Error(`BAD MOCK: No fieldsToSerialize for DB table ${key}`)
    }
    snapshot[key] = dynamicSerializer.toStatic(doc, fieldsToSerialize[key], {
      constant: unsortables.has(key)
    })
  }
  return snapshot
}

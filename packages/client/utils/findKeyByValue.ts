/*
 * given an object and value, it will return the first key that matches the value
 * */
const findKeyByValue = (obj: object, val: any) => {
  const keys = Object.keys(obj)
  for (let ii = 0; ii < keys.length; ii++) {
    const key = keys[ii]!
    if (val === obj[key]) return key
  }
  return undefined
}

export default findKeyByValue

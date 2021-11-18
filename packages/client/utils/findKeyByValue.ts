/*
 * given an object and value, it will return the first key that matches the value
 * */
const findKeyByValue = (obj: object, val: any) => {
  return Object.keys(obj).find((key) => obj[key] === val)
}

export default findKeyByValue

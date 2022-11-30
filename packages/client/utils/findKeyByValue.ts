/*
 * given an object and value, it will return the first key that matches the value
 * */
const findKeyByValue = <T extends Record<string, any>>(obj: T, val: keyof T) => {
  return Object.keys(obj).find((key) => obj[key as keyof T] === val)
}

export default findKeyByValue

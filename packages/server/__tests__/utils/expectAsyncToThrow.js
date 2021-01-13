/* eslint-env jest */

export default async function expectAsyncToThrow (promise, idLookup = []) {
  try {
    await promise
    throw new Error(`Jest: promise did not throw! ${Math.random()}`)
  } catch (e) {
    idLookup.forEach((key, idx) => {
      e.message = e.message.replace(key, idx)
    })
    expect(() => {
      throw e
    }).toThrowErrorMatchingSnapshot()
  }
}

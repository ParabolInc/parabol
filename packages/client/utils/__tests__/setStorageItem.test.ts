import setStorageItem from '../setStorageItem'

const stubStorage = (name: 'localStorage' | 'sessionStorage', getStorage: () => unknown) => {
  Object.defineProperty(globalThis, 'window', {value: {}, configurable: true})
  Object.defineProperty(window, name, {get: getStorage, configurable: true})
}

test('a write goes to the storage it names', () => {
  const setItem = jest.fn()
  stubStorage('sessionStorage', () => ({setItem}))
  setStorageItem('sessionStorage', 'draft', '{}')
  expect(setItem).toHaveBeenCalledWith('draft', '{}')
})

test('a write to a full storage is dropped instead of thrown', () => {
  stubStorage('localStorage', () => ({
    setItem: () => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
    }
  }))
  expect(() => setStorageItem('localStorage', 'draft', '{}')).not.toThrow()
})

test('a write to a storage the user blocks is dropped instead of thrown', () => {
  stubStorage('localStorage', () => {
    throw new DOMException('The operation is insecure.', 'SecurityError')
  })
  expect(() => setStorageItem('localStorage', 'draft', '{}')).not.toThrow()
})

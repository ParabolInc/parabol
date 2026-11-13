import setStorageItem from '../setStorageItem'

const stubStorage = (name: 'localStorage' | 'sessionStorage', getStorage: () => unknown) => {
  Object.defineProperty(globalThis, 'window', {value: {}, configurable: true})
  Object.defineProperty(window, name, {get: getStorage, configurable: true})
}

const spyOnWarn = () => jest.spyOn(console, 'warn').mockImplementation(() => {})

afterEach(() => {
  jest.restoreAllMocks()
})

test('a write goes to the storage it names', () => {
  const warn = spyOnWarn()
  const setItem = jest.fn()
  stubStorage('sessionStorage', () => ({setItem}))
  setStorageItem('sessionStorage', 'draft', '{}')
  expect(setItem).toHaveBeenCalledWith('draft', '{}')
  expect(warn).not.toHaveBeenCalled()
})

test('a write to a full storage is dropped with a warning instead of thrown', () => {
  const warn = spyOnWarn()
  const quotaError = new DOMException('The quota has been exceeded.', 'QuotaExceededError')
  stubStorage('localStorage', () => ({
    setItem: () => {
      throw quotaError
    }
  }))
  expect(() => setStorageItem('localStorage', 'draft', '{}')).not.toThrow()
  expect(warn).toHaveBeenCalledWith('Could not save draft to localStorage', quotaError)
})

test('a write to a storage the user blocks is dropped with a warning instead of thrown', () => {
  const warn = spyOnWarn()
  const securityError = new DOMException('The operation is insecure.', 'SecurityError')
  stubStorage('localStorage', () => {
    throw securityError
  })
  expect(() => setStorageItem('localStorage', 'draft', '{}')).not.toThrow()
  expect(warn).toHaveBeenCalledWith('Could not save draft to localStorage', securityError)
})

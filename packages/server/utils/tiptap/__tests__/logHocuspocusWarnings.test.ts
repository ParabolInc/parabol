import {Logger} from '../../Logger'
import logHocuspocusWarnings from '../logHocuspocusWarnings'

test('Hocuspocus warnings go through Logger and other warnings print as before', () => {
  const originalWarn = console.warn
  const printWarning = jest.fn()
  console.warn = printWarning
  const loggerWarn = jest.spyOn(Logger, 'warn').mockImplementation(() => {})
  logHocuspocusWarnings()
  const limitWarning =
    'Hocuspocus: closing connection abc: too many pending unauthenticated documents (maxPendingDocuments 500). Last requested document: "meeting:1".'
  console.warn(limitWarning)
  console.warn('something else', 1)
  expect(loggerWarn).toHaveBeenCalledWith(limitWarning)
  expect(printWarning).toHaveBeenCalledTimes(1)
  expect(printWarning).toHaveBeenCalledWith('something else', 1)
  loggerWarn.mockRestore()
  console.warn = originalWarn
})

test('a Hocuspocus warning that Logger prints with console.warn is not rerouted again', () => {
  const originalWarn = console.warn
  const printWarning = jest.fn()
  console.warn = printWarning
  logHocuspocusWarnings()
  console.warn('Hocuspocus: closing connection abc: limit exceeded')
  expect(printWarning).toHaveBeenCalledTimes(1)
  console.warn = originalWarn
})

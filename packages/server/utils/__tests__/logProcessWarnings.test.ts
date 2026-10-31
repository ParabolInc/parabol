import logProcessWarnings from '../logProcessWarnings'

test('process warnings are logged as warnings instead of printed by Node', () => {
  const listeners = process.listeners('warning')
  // stands in for the printer Node registers by default
  const printWarning = jest.fn()
  process.on('warning', printWarning)
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
  logProcessWarnings()
  const warning = Object.assign(new Error('Client.activeQuery is deprecated'), {
    name: 'DeprecationWarning'
  })
  process.emit('warning', warning)
  expect(printWarning).not.toHaveBeenCalled()
  expect(warnSpy).toHaveBeenCalledWith(warning)
  process.removeAllListeners('warning')
  listeners.forEach((listener) => process.on('warning', listener))
  warnSpy.mockRestore()
})

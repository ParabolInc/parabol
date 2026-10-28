import type {Extension, onAuthenticatePayload} from '@hocuspocus/server'
import {SafeHocuspocus} from '../SafeHocuspocus'

const makeHocuspocus = (extensions: Extension[]) =>
  new SafeHocuspocus<Record<string, never>>({quiet: true, extensions})

const fail = async () => {
  throw new Error('hook failed')
}

test('resolves an unawaited hook that throws instead of rejecting', async () => {
  const hocuspocus = makeHocuspocus([{afterUnloadDocument: fail}])
  await expect(
    hocuspocus.hooks('afterUnloadDocument', {instance: hocuspocus, documentName: 'page:1'})
  ).resolves.toBeUndefined()
})

test('still rejects hooks whose callers act on the rejection', async () => {
  const hocuspocus = makeHocuspocus([{onAuthenticate: fail}])
  const payload = {documentName: 'page:1'} as onAuthenticatePayload
  await expect(hocuspocus.hooks('onAuthenticate', payload)).rejects.toThrow('hook failed')
})

test('a throwing hook still skips the hooks of later extensions', async () => {
  const laterHook = jest.fn()
  const hocuspocus = makeHocuspocus([
    {priority: 2, afterUnloadDocument: fail},
    {priority: 1, afterUnloadDocument: laterHook}
  ])
  await hocuspocus.hooks('afterUnloadDocument', {instance: hocuspocus, documentName: 'page:1'})
  expect(laterHook).not.toHaveBeenCalled()
})

test('unloads a document whose onDisconnect and afterUnloadDocument hooks throw', async () => {
  const hocuspocus = makeHocuspocus([{onDisconnect: fail, afterUnloadDocument: fail}])
  const connection = await hocuspocus.openDirectConnection('page:1')
  await connection.transact((document) => {
    document.getMap('test').set('key', 'value')
  })
  await connection.disconnect()
  expect(hocuspocus.documents.has('page:1')).toBe(false)
  expect(hocuspocus.unloadingDocuments.size).toBe(0)
})

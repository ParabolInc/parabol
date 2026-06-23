/**
 * Regression test for the DirectConnection leak in fetchUserIdsInSameMeeting.
 *
 * Root cause: conn.disconnect() was never called, so directConnectionsCount
 * never reached 0, so hocuspocus never unloaded the document.
 */
import {applyYjsUpdate, fetchUserIdsInSameMeeting} from '../tiptap/hocusPocusCustomEvents'

const mockDisconnect = jest.fn().mockResolvedValue(undefined)

jest.mock('../../hocusPocus', () => ({
  hocuspocus: {
    openDirectConnection: jest.fn()
  }
}))

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {hocuspocus} = require('../../hocusPocus') as {
  hocuspocus: {openDirectConnection: jest.Mock}
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('fetchUserIdsInSameMeeting calls disconnect when document is null', async () => {
  hocuspocus.openDirectConnection.mockResolvedValue({
    document: null,
    disconnect: mockDisconnect
  })

  const result = await fetchUserIdsInSameMeeting('meeting:test')

  expect(result).toEqual([])
  expect(mockDisconnect).toHaveBeenCalledTimes(1)
})

test('fetchUserIdsInSameMeeting calls disconnect after reading awareness', async () => {
  hocuspocus.openDirectConnection.mockResolvedValue({
    document: {
      awareness: {
        getStates: () => new Map([['client1', {userId: 'user1'}]])
      }
    },
    disconnect: mockDisconnect
  })

  const result = await fetchUserIdsInSameMeeting('meeting:test')

  expect(result).toEqual(['user1'])
  expect(mockDisconnect).toHaveBeenCalledTimes(1)
})

test('fetchUserIdsInSameMeeting ignores null/undefined awareness states without leaking', async () => {
  hocuspocus.openDirectConnection.mockResolvedValue({
    document: {
      awareness: {
        getStates: () =>
          new Map<string, any>([
            ['client1', {userId: 'user1'}],
            ['client2', null],
            ['client3', undefined],
            ['client4', {}]
          ])
      }
    },
    disconnect: mockDisconnect
  })

  const result = await fetchUserIdsInSameMeeting('meeting:test')

  expect(result).toEqual(['user1'])
  expect(mockDisconnect).toHaveBeenCalledTimes(1)
})

test('fetchUserIdsInSameMeeting calls disconnect even when reading awareness throws', async () => {
  hocuspocus.openDirectConnection.mockResolvedValue({
    document: {
      awareness: {
        getStates: () => {
          throw new Error('boom')
        }
      }
    },
    disconnect: mockDisconnect
  })

  await expect(fetchUserIdsInSameMeeting('meeting:test')).rejects.toThrow('boom')
  expect(mockDisconnect).toHaveBeenCalledTimes(1)
})

test('withDoc handlers call disconnect even when the transaction throws', async () => {
  const mockTransact = jest.fn().mockRejectedValue(new Error('transact failed'))
  hocuspocus.openDirectConnection.mockResolvedValue({
    document: {},
    transact: mockTransact,
    disconnect: mockDisconnect
  })

  await expect(applyYjsUpdate('page:test', {update: new Uint8Array()})).rejects.toThrow(
    'transact failed'
  )
  expect(mockTransact).toHaveBeenCalledTimes(1)
  expect(mockDisconnect).toHaveBeenCalledTimes(1)
})

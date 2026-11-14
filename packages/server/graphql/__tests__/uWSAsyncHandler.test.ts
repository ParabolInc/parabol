import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import logError from '../../utils/logError'
import uWSAsyncHandler from '../uWSAsyncHandler'

jest.mock('../../utils/logError')

const makeRequest = () => ({getHeader: () => ''}) as unknown as HttpRequest

const makeResponse = () => {
  const sent: {status?: string; body?: unknown}[] = []
  let abort = () => {}
  const res = {
    onAborted: (handler: () => void) => {
      abort = handler
      return res
    },
    cork: (thunk: () => unknown) => thunk(),
    writeStatus: (status: string) => {
      sent.push({status})
      return res
    },
    writeHeader: () => res,
    end: (body?: unknown) => {
      sent.push({body})
      return res
    }
  }
  return {res: res as unknown as HttpResponse, sent, abort: () => abort()}
}

test('a handler that never responds is logged and answered with a 503', async () => {
  const {res, sent} = makeResponse()
  await uWSAsyncHandler(async () => {})(res, makeRequest())
  expect(logError).toHaveBeenCalledWith(new Error('Async handler did not respond'), {
    userId: undefined
  })
  expect(sent).toEqual([{status: '503'}, {body: undefined}])
})

test('a request the client aborts before the handler responds is not an error', async () => {
  const {res, sent, abort} = makeResponse()
  await uWSAsyncHandler(async (response) => {
    await Promise.resolve()
    abort()
    response.writeStatus('307').writeHeader('Location', '/elsewhere').end()
  })(res, makeRequest())
  expect(logError).not.toHaveBeenCalled()
  expect(sent).toEqual([])
})

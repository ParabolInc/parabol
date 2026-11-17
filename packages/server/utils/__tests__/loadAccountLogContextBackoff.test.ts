import loadAccountLogContext from '../loadAccountLogContext'

const execute = jest.fn(async () => {
  throw new Error('too many clients already')
})
// any query chain ends in execute, which fails the way a struggling database does
const failingQuery: object = new Proxy(
  {},
  {get: (_target, property) => (property === 'execute' ? execute : () => failingQuery)}
)
jest.mock('../../postgres/getKysely', () => () => failingQuery)

test('after a failed lookup, errors are written without an account for a while instead of adding queries', async () => {
  expect(await loadAccountLogContext({userId: 'user1'})).toBeUndefined()
  expect(execute).toHaveBeenCalledTimes(1)
  expect(await loadAccountLogContext({userId: 'user2'})).toBeUndefined()
  expect(execute).toHaveBeenCalledTimes(1)
})

import {getLogContext, runWithLogContext, runWithoutLogContext} from '../requestLogContext'

const readContextFromTimer = () =>
  new Promise((resolve) => setTimeout(() => resolve(getLogContext()), 0))

test('a timer started inside a log context logs with it', async () => {
  const contextSeenByTimer = await runWithLogContext({sessionId: 'tab-1'}, readContextFromTimer)
  expect(contextSeenByTimer).toEqual({sessionId: 'tab-1'})
})

test('a timer started without the log context does not keep it', async () => {
  const contextSeenByTimer = await runWithLogContext({sessionId: 'tab-1'}, () =>
    runWithoutLogContext(readContextFromTimer)
  )
  expect(contextSeenByTimer).toBeUndefined()
})

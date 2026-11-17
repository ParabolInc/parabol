import '../../tiptap/extensions/__tests__/installHappyDom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {RelayEnvironmentProvider} from 'react-relay'
import {Environment, Network, RecordSource, Store} from 'relay-runtime'
import {useDuplicatePageMutation} from '../useDuplicatePageMutation'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: () => jest.requireActual('../../__generated__/useDuplicatePageMutation.graphql').default
}))
jest.mock('../../hooks/useAtmosphere', () => ({
  __esModule: true,
  default: () => ({eventEmitter: {emit: jest.fn()}})
}))

let root: Root
let container: HTMLElement

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

const setup = () => {
  const resolvers: Array<() => void> = []
  const fetchFn = jest.fn(
    () =>
      new Promise<{data: {duplicatePage: null}}>((resolve) => {
        resolvers.push(() => resolve({data: {duplicatePage: null}}))
      })
  )
  const environment = new Environment({
    network: Network.create(fetchFn),
    store: new Store(new RecordSource())
  })
  let execute: ReturnType<typeof useDuplicatePageMutation>[0] | undefined
  const Probe = () => {
    ;[execute] = useDuplicatePageMutation()
    return null
  }
  act(() =>
    root.render(
      <RelayEnvironmentProvider environment={environment}>
        <Probe />
      </RelayEnvironmentProvider>
    )
  )
  return {execute: () => execute!, fetchFn, resolvers}
}

test('execute ignores repeat calls while one is in flight', async () => {
  const {execute, fetchFn, resolvers} = setup()
  const onCompleted = jest.fn()
  const onError = jest.fn()
  const config = {variables: {pageId: 'page:1'}, onCompleted, onError}
  await act(async () => {
    execute()(config)
    execute()(config)
  })
  expect(fetchFn).toHaveBeenCalledTimes(1)
  await act(async () => {
    resolvers[0]!()
  })
  expect(onCompleted).toHaveBeenCalledTimes(1)
  await act(async () => {
    execute()(config)
  })
  expect(fetchFn).toHaveBeenCalledTimes(2)
})

test('execute can run again after an error', async () => {
  const fetchFn = jest.fn(async () => {
    throw new Error('boom')
  })
  const environment = new Environment({
    network: Network.create(fetchFn),
    store: new Store(new RecordSource())
  })
  let execute: ReturnType<typeof useDuplicatePageMutation>[0] | undefined
  const Probe = () => {
    ;[execute] = useDuplicatePageMutation()
    return null
  }
  act(() =>
    root.render(
      <RelayEnvironmentProvider environment={environment}>
        <Probe />
      </RelayEnvironmentProvider>
    )
  )
  const onError = jest.fn()
  await act(async () => {
    execute!({variables: {pageId: 'page:1'}, onError})
  })
  await act(async () => {
    execute!({variables: {pageId: 'page:1'}, onError})
  })
  expect(fetchFn).toHaveBeenCalledTimes(2)
  expect(onError).toHaveBeenCalledTimes(2)
})

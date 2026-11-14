import {Window} from 'happy-dom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {useDebouncedSearch} from '../useDebouncedSearch'

const happyWindow = new Window({url: 'https://parabol.test/'})
let root: Root
let container: HTMLElement

const Probe = (props: {search: string}) => {
  const {debouncedSearch} = useDebouncedSearch(props.search)
  return <span data-search={debouncedSearch} />
}

const type = (search: string) => {
  act(() => {
    root.render(<Probe search={search} />)
  })
}

const debouncedSearch = () => container.querySelector('span')?.dataset.search

beforeAll(() => {
  Object.assign(globalThis, {
    window: happyWindow,
    document: happyWindow.document,
    IS_REACT_ACT_ENVIRONMENT: true
  })
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

beforeEach(() => {
  jest.useFakeTimers({doNotFake: ['setImmediate', 'queueMicrotask', 'nextTick']})
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  jest.useRealTimers()
})

test('starts with the search it is given', () => {
  type('MCP')
  expect(debouncedSearch()).toBe('MCP')
})

test('holds back a word being typed until the typing pauses', () => {
  type('')
  type('M')
  type('MC')
  type('MCP')
  expect(debouncedSearch()).toBe('')
  act(() => {
    jest.advanceTimersByTime(500)
  })
  expect(debouncedSearch()).toBe('MCP')
})

test('passes on a finished word at once', () => {
  type('')
  type('MCP:')
  expect(debouncedSearch()).toBe('MCP:')
})

import '../../__tests__/installHappyDom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {happyWindow} from '../../__tests__/installHappyDom'
import MoveToPageResultsRoot from '../MoveToPageResultsRoot'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('../../../../hooks/useQueryLoaderNow', () => ({
  useQueryLoaderNowWithRetry: () => ({queryRef: {variables: {textFilter: ''}}})
}))
jest.mock('../../../../hooks/useAtmosphere', () => ({__esModule: true, default: () => ({})}))
jest.mock('../../../../utils/errorFilters', () => ({
  isIgnoredError: () => false,
  isNotSignedInError: () => false
}))
jest.mock('../../../../utils/reportClientError', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../../../components/ErrorComponent/ErrorComponent', () => ({
  __esModule: true,
  default: () => null
}))
jest.mock('../MoveToPageResults', () => ({
  __esModule: true,
  default: () => {
    throw new Error('pages failed to load')
  }
}))

let root: Root | undefined

afterEach(async () => {
  await act(async () => {
    root?.unmount()
    root = undefined
  })
  document.body.replaceChildren()
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

test('a failed query shows one muted row instead of breaking the editor', async () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
  const host = document.body.appendChild(document.createElement('div'))
  await act(async () => {
    root = createRoot(host)
    root.render(
      <MoveToPageResultsRoot
        textFilter=''
        drag={{sourcePageId: 'page:0', childPageIds: [], refusal: null}}
        onPick={jest.fn()}
        onFirstAllowed={jest.fn()}
      />
    )
  })
  expect(host.textContent).toBe('Couldn’t load pages')
  consoleError.mockRestore()
})

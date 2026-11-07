import '../../../tiptap/extensions/__tests__/installHappyDom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import type {PreloadedQuery} from 'react-relay'
import type {ClickUpScopingCurrentFiltersQuery} from '../../../__generated__/ClickUpScopingCurrentFiltersQuery.graphql'
import {happyWindow} from '../../../tiptap/extensions/__tests__/installHappyDom'
import {EMPTY_SCOPING_SEARCH_STATE} from '../../platform/ScopingSearchState'
import ClickUpScopingCurrentFilters from '../ClickUpScopingCurrentFilters'

const mockData = {
  viewer: {
    teamMember: {
      services: [
        {
          service: 'clickup',
          repos: [{id: 'repo2', name: 'Space / Beta', integrationRepoId: '2'}]
        }
      ]
    }
  }
}

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('react-relay', () => ({
  ...jest.requireActual('react-relay'),
  usePreloadedQuery: () => mockData
}))

const queryRef = {} as PreloadedQuery<ClickUpScopingCurrentFiltersQuery>
let root: Root
let container: ReturnType<typeof happyWindow.document.createElement>

const renderFilters = async (listIds: string[]) => {
  const filters = listIds.map((value) => ({key: 'listIds', value}))
  await act(async () =>
    root.render(
      <ClickUpScopingCurrentFilters
        state={{...EMPTY_SCOPING_SEARCH_STATE, filters}}
        queryRef={queryRef}
      />
    )
  )
  return container.textContent
}

beforeEach(() => {
  container = happyWindow.document.createElement('div')
  happyWindow.document.body.appendChild(container)
  root = createRoot(container as unknown as Element)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
})

test('current filters name the picked lists', async () => {
  await expect(renderFilters(['2'])).resolves.toBe('Space / Beta')
})

test('current filters count picked lists that no longer resolve instead of saying None', async () => {
  await expect(renderFilters(['2', '901423080038'])).resolves.toBe(
    'Space / Beta, 1 unavailable list'
  )
  await expect(renderFilters(['901423080038', '901423080039'])).resolves.toBe('2 unavailable lists')
})

test('current filters say None with no list picked', async () => {
  await expect(renderFilters([])).resolves.toBe('None')
})

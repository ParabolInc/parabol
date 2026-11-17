import {Window} from 'happy-dom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import DiscussionComposerTabs, {type DiscussionComposerTab} from '../DiscussionComposerTabs'

const happyWindow = new Window({url: 'https://parabol.test/'})
let root: Root
let container: ReturnType<typeof happyWindow.document.createElement>
const onChange = jest.fn()

const render = async (activeTab: DiscussionComposerTab, isTaskDisabled = false) => {
  await act(async () =>
    root.render(
      <DiscussionComposerTabs
        activeTab={activeTab}
        isTaskDisabled={isTaskDisabled}
        onChange={onChange}
      />
    )
  )
}
const getTab = (name: DiscussionComposerTab) =>
  container.querySelector(`[data-tab="${name}"]`) as unknown as HTMLButtonElement
const pressKey = async (tab: HTMLButtonElement, key: string) => {
  await act(async () => {
    tab.dispatchEvent(new happyWindow.KeyboardEvent('keydown', {key, bubbles: true}) as never)
  })
}

beforeAll(() => {
  Object.assign(globalThis, {
    IS_REACT_ACT_ENVIRONMENT: true,
    window: happyWindow,
    document: happyWindow.document
  })
})

beforeEach(() => {
  onChange.mockReset()
  container = happyWindow.document.createElement('div')
  happyWindow.document.body.appendChild(container)
  root = createRoot(container as unknown as Element)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
})

test('Comment is selected and the only tab in the tab order', async () => {
  await render('comment')
  expect(getTab('comment').getAttribute('aria-selected')).toBe('true')
  expect(getTab('comment').tabIndex).toBe(0)
  expect(getTab('task').tabIndex).toBe(-1)
})

test('arrow keys move focus between tabs without opening one', async () => {
  await render('comment')
  getTab('comment').focus()
  await pressKey(getTab('comment'), 'ArrowRight')
  expect(happyWindow.document.activeElement).toBe(getTab('task'))
  await pressKey(getTab('task'), 'ArrowLeft')
  expect(happyWindow.document.activeElement).toBe(getTab('comment'))
  expect(onChange).not.toHaveBeenCalled()
})

test('clicking a tab opens it', async () => {
  await render('comment')
  await act(async () => getTab('task').click())
  expect(onChange).toHaveBeenCalledWith('task')
})

test('a disabled Task tab is skipped by the arrow keys', async () => {
  await render('comment', true)
  getTab('comment').focus()
  await pressKey(getTab('comment'), 'ArrowRight')
  expect(happyWindow.document.activeElement).toBe(getTab('comment'))
  expect(getTab('task').disabled).toBe(true)
})

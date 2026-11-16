import '../../tiptap/extensions/__tests__/installHappyDom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import SnackbarMessage from '../SnackbarMessage'

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

const description = () => container.querySelector<HTMLElement>('.text-white')!

test('a link reads as underlined text and opens without dismissing the snack', () => {
  const dismissSnack = jest.fn()
  const callback = jest.fn()
  act(() =>
    root.render(
      <SnackbarMessage
        message='Removed here. Still on 1 page.'
        link={{label: 'Handbook', suffix: ' now holds the original.', callback}}
        dismissSnack={dismissSnack}
      />
    )
  )
  expect(description().textContent).toBe(
    'Removed here. Still on 1 page. Handbook now holds the original.'
  )
  const link = description().querySelector('button')!
  expect(link.type).toBe('button')
  expect(link.className).toContain('underline')
  act(() => link.click())
  expect(callback).toHaveBeenCalledTimes(1)
  expect(dismissSnack).not.toHaveBeenCalled()
})

test('a snack without a link shows only its message and dismisses on click', () => {
  const dismissSnack = jest.fn()
  act(() => root.render(<SnackbarMessage message='Moved to trash' dismissSnack={dismissSnack} />))
  expect(description().innerHTML).toBe('Moved to trash')
  act(() => description().click())
  expect(dismissSnack).toHaveBeenCalledTimes(1)
})

import '../../__tests__/installHappyDom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {MenuItem} from '../../../../ui/Menu/MenuItem'
import {SyncedBlockPlacesMenu} from '../SyncedBlockPlacesMenu'

let root: Root
let container: HTMLElement

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  document.body.replaceChildren()
})

const renderMenu = (onOpenChange: (open: boolean) => void) => {
  act(() =>
    root.render(
      <SyncedBlockPlacesMenu label='Also on 1 page' isViewOnly={false} onOpenChange={onOpenChange}>
        <MenuItem>Runbook</MenuItem>
      </SyncedBlockPlacesMenu>
    )
  )
  return container.querySelector('button')!
}

const openWithKeyboard = (trigger: HTMLElement) => {
  act(() => trigger.focus())
  act(() => {
    trigger.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}))
  })
}

test('reports open from the open handler, before any effect runs', () => {
  const reports: boolean[] = []
  const trigger = renderMenu((open) => reports.push(open))
  act(() => trigger.focus())
  let reportedDuringEvent: boolean[] = []
  act(() => {
    trigger.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}))
    reportedDuringEvent = [...reports]
  })
  expect(document.body.querySelector('[role="menu"]')).not.toBeNull()
  expect(reportedDuringEvent).toEqual([true])
})

test('reports close when the menu unmounts while open', () => {
  const reports: boolean[] = []
  const trigger = renderMenu((open) => reports.push(open))
  openWithKeyboard(trigger)
  act(() => root.render(null))
  expect(reports).toEqual([true, false])
})

import '../../tiptap/extensions/__tests__/installHappyDom'
import EventEmitter from 'eventemitter3'
import {act, type ReactNode} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {RelayEnvironmentProvider} from 'react-relay'
import {Environment, Network, Observable, RecordSource, Store} from 'relay-runtime'
import type {DeleteAccountModal_viewer$key} from '../../__generated__/DeleteAccountModal_viewer.graphql'
import {happyWindow} from '../../tiptap/extensions/__tests__/installHappyDom'
import DeleteAccountModal from '../DeleteAccountModal'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: (template: TemplateStringsArray) =>
    template.join('').includes('mutation useDeleteUserMutation')
      ? jest.requireActual('../../__generated__/useDeleteUserMutation.graphql').default
      : {}
}))
jest.mock('react-relay', () => ({
  ...jest.requireActual('react-relay'),
  useFragment: (_fragment: unknown, fragmentRef: unknown) => fragmentRef
}))
// happy-dom can't run motion's exit animation, so the dialog's frame is just its children
jest.mock('../../ui/Dialog/Dialog', () => ({
  Dialog: ({children}: {children: ReactNode}) => children
}))
jest.mock('../../ui/Dialog/DialogContent', () => ({
  DialogContent: ({children}: {children: ReactNode}) => children
}))
jest.mock('../../ui/Dialog/DialogTitle', () => ({
  DialogTitle: ({children}: {children: ReactNode}) => children
}))
jest.mock('../../hooks/useAtmosphere', () => ({
  __esModule: true,
  default: () => ({viewerId: 'user1', eventEmitter: new EventEmitter()})
}))

let root: Root

afterEach(async () => {
  await act(async () => root.unmount())
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

test('a user who clicks Goodbye forever again while their account is being deleted sends one deletion', async () => {
  // the server is still deleting the account, so the request never answers
  const fetchDeletion = jest.fn(() => Observable.create(() => {}))
  const environment = new Environment({
    network: Network.create(fetchDeletion),
    store: new Store(new RecordSource())
  })
  const container = happyWindow.document.createElement('div')
  happyWindow.document.body.appendChild(container)
  root = createRoot(container as unknown as HTMLElement)
  await act(async () =>
    root.render(
      <RelayEnvironmentProvider environment={environment}>
        <DeleteAccountModal
          isOpen
          onClose={() => {}}
          viewerRef={{} as DeleteAccountModal_viewer$key}
        />
      </RelayEnvironmentProvider>
    )
  )

  const reason = happyWindow.document.querySelector('textarea')!
  const setReason = Object.getOwnPropertyDescriptor(
    happyWindow.HTMLTextAreaElement.prototype,
    'value'
  )!.set!
  await act(async () => {
    setReason.call(reason, 'not really')
    reason.dispatchEvent(new happyWindow.Event('input', {bubbles: true}))
  })
  const goodbye = [...happyWindow.document.querySelectorAll('button')].find(
    (button) => button.textContent === 'Goodbye forever'
  )!
  for (let click = 0; click < 3; click++) {
    await act(async () => goodbye.click())
  }

  expect(fetchDeletion).toHaveBeenCalledTimes(1)
  expect(goodbye.disabled).toBe(true)
})

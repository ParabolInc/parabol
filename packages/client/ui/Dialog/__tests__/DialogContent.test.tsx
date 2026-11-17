import {Window} from 'happy-dom'
import {MotionGlobalConfig} from 'motion/react'
import {act, lazy, type ReactNode, Suspense} from 'react'
import {createRoot, type Root} from 'react-dom/client'

MotionGlobalConfig.skipAnimations = true

const happyWindow = new Window({url: 'https://parabol.test/'})
Object.assign(globalThis, {
  window: happyWindow,
  document: happyWindow.document,
  getComputedStyle: happyWindow.getComputedStyle.bind(happyWindow),
  MutationObserver: happyWindow.MutationObserver,
  HTMLElement: happyWindow.HTMLElement,
  Node: happyWindow.Node,
  Element: happyWindow.Element,
  HTMLInputElement: happyWindow.HTMLInputElement,
  NodeFilter: happyWindow.NodeFilter,
  Event: happyWindow.Event,
  CustomEvent: happyWindow.CustomEvent,
  requestAnimationFrame: happyWindow.requestAnimationFrame.bind(happyWindow),
  cancelAnimationFrame: happyWindow.cancelAnimationFrame.bind(happyWindow),
  IS_REACT_ACT_ENVIRONMENT: true
})

const NeverLoads = lazy(() => new Promise<{default: () => ReactNode}>(() => {}))

let mountedRoot: Root | undefined

const renderOpen = async (node: ReactNode) => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
  const container = document.createElement('div')
  document.body.appendChild(container)
  mountedRoot = createRoot(container)
  await act(async () => mountedRoot?.render(node))
  const dialog = document.body.querySelector('[role="dialog"]')
  const titleId = dialog?.getAttribute('aria-labelledby')
  return {
    dialogName: titleId ? document.getElementById(titleId)?.textContent : undefined,
    titleWarnings: consoleError.mock.calls.filter(([message]) =>
      String(message).includes('requires a `DialogTitle`')
    )
  }
}

afterEach(() => {
  act(() => mountedRoot?.unmount())
  mountedRoot = undefined
  jest.restoreAllMocks()
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

describe('DialogContent', () => {
  it('names the dialog with its title before its content has loaded', async () => {
    const {Dialog} = await import('../Dialog')
    const {DialogContent} = await import('../DialogContent')
    const {dialogName, titleWarnings} = await renderOpen(
      <Dialog isOpen>
        <DialogContent hiddenTitle='Formatting Text'>
          <Suspense fallback=''>
            <NeverLoads />
          </Suspense>
        </DialogContent>
      </Dialog>
    )
    expect(dialogName).toBe('Formatting Text')
    expect(titleWarnings).toEqual([])
  })

  it('names the demo prompt, which shows no heading', async () => {
    const {default: BeginDemoModal} = await import('../../../components/BeginDemoModal')
    const {dialogName, titleWarnings} = await renderOpen(
      <BeginDemoModal isOpen startDemo={() => {}} />
    )
    expect(dialogName).toBe('Try the Parabol demo')
    expect(titleWarnings).toEqual([])
  })
})

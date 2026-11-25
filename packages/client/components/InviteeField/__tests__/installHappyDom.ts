import {Window} from 'happy-dom'

const happyWindow = new Window({url: 'https://parabol.test/'})

Object.assign(globalThis, {
  window: happyWindow,
  document: happyWindow.document,
  navigator: happyWindow.navigator,
  Node: happyWindow.Node,
  Element: happyWindow.Element,
  HTMLElement: happyWindow.HTMLElement,
  HTMLInputElement: happyWindow.HTMLInputElement,
  Event: happyWindow.Event,
  CustomEvent: happyWindow.CustomEvent,
  KeyboardEvent: happyWindow.KeyboardEvent,
  MouseEvent: happyWindow.MouseEvent,
  PointerEvent: happyWindow.PointerEvent,
  FocusEvent: happyWindow.FocusEvent,
  ResizeObserver: happyWindow.ResizeObserver,
  IntersectionObserver: happyWindow.IntersectionObserver,
  getComputedStyle: happyWindow.getComputedStyle.bind(happyWindow),
  requestAnimationFrame: happyWindow.requestAnimationFrame.bind(happyWindow),
  cancelAnimationFrame: happyWindow.cancelAnimationFrame.bind(happyWindow),
  IS_REACT_ACT_ENVIRONMENT: true
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

import '../../__tests__/installHappyDom'
import {stopPageLinkBlockEvent} from '../stopPageLinkBlockEvent'

const keydownOn = (target: Element) => {
  const event = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true})
  Object.defineProperty(event, 'target', {value: target})
  return event
}

const mountBlock = () => {
  const blockDom = document.createElement('div')
  blockDom.innerHTML = `
    <div data-synced-chrome><button>Copy and sync</button></div>
    <div data-synced-editor><div class="ProseMirror"><p>Sev 1</p><div data-inner-link><span>Inner page</span></div></div></div>
    <div data-plain><span>Other</span></div>`
  document.body.appendChild(blockDom)
  return blockDom
}

describe('stopPageLinkBlockEvent', () => {
  test('keeps keys on the bar buttons out of the host', () => {
    const blockDom = mountBlock()
    expect(stopPageLinkBlockEvent(keydownOn(blockDom.querySelector('button')!), blockDom)).toBe(
      true
    )
  })

  test('keeps keys typed in the nested editor out of the host', () => {
    const blockDom = mountBlock()
    expect(stopPageLinkBlockEvent(keydownOn(blockDom.querySelector('p')!), blockDom)).toBe(true)
  })

  test('leaves a page link inside a block to its own editor', () => {
    const blockDom = mountBlock()
    const innerLinkDom = blockDom.querySelector<HTMLElement>('[data-inner-link]')!
    expect(
      stopPageLinkBlockEvent(keydownOn(innerLinkDom.querySelector('span')!), innerLinkDom)
    ).toBe(false)
  })

  test('leaves other keys to the host', () => {
    const blockDom = mountBlock()
    expect(
      stopPageLinkBlockEvent(keydownOn(blockDom.querySelector('[data-plain] span')!), blockDom)
    ).toBe(false)
  })

  test('stops every mousedown so only the drag handle drags the block', () => {
    const blockDom = mountBlock()
    const event = new MouseEvent('mousedown', {bubbles: true})
    Object.defineProperty(event, 'target', {value: blockDom.querySelector('[data-plain] span')})
    expect(stopPageLinkBlockEvent(event, blockDom)).toBe(true)
  })
})

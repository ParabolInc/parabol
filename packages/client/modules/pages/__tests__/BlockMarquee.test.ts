import '../../../tiptap/extensions/__tests__/installHappyDom'
import {isMarqueeStart} from '../useBlockMarquee'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))

const html = `
<div id="page" data-page-surface>
  <div data-page-header><span id="header"></span></div>
  <div id="column">
    <div id="margin"></div>
    <div id="editor" class="ProseMirror">
      <p id="text">hello <a id="link" href="#">link</a></p>
      <div class="drag-handle" id="handle"><svg id="handleIcon"></svg></div>
      <button id="btn"><span id="btnLabel"></span></button>
      <input id="input" />
    </div>
    <div id="bubble"><button id="bubbleBtn"></button><span id="bubbleText"></span></div>
    <div data-starter-actions><button id="starter"><span id="starterLabel"></span></button></div>
    <div id="below"></div>
  </div>
</div>`

const setup = () => {
  document.body.innerHTML = html
  const get = (id: string) => document.getElementById(id)!
  return {editorDom: get('editor'), get}
}

describe('isMarqueeStart', () => {
  test.each(['column', 'page'])('starts from side margins and wrappers (%s)', (id) => {
    const {editorDom, get} = setup()
    expect(isMarqueeStart(get(id), editorDom)).toBe(true)
  })
  test('does not start from the editor element itself (gaps between blocks)', () => {
    const {editorDom} = setup()
    expect(isMarqueeStart(editorDom, editorDom)).toBe(false)
  })
  test.each([
    'text',
    'link',
    'handle',
    'handleIcon',
    'btn',
    'btnLabel',
    'input',
    'starter',
    'starterLabel',
    'header',
    'bubble',
    'bubbleBtn',
    'bubbleText',
    'margin',
    'below'
  ])('does not start from %s', (id) => {
    const {editorDom, get} = setup()
    expect(isMarqueeStart(get(id), editorDom)).toBe(false)
  })
})

import {JSDOM} from 'jsdom'

function simpleDOMBuilder(html: string) {
  const {document, HTMLElement, HTMLAnchorElement} = new JSDOM(`<!DOCTYPE html>`).window

  global.HTMLElement = HTMLElement
  global.HTMLAnchorElement = HTMLAnchorElement

  const doc = document.implementation.createHTMLDocument('foo')
  doc.documentElement.innerHTML = html
  return doc.getElementsByTagName('body')[0]
}

export default simpleDOMBuilder

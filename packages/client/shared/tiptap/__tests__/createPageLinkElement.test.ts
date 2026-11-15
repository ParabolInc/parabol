import {Doc, type XmlElement} from 'yjs'
import {createPageLinkElement} from '../createPageLinkElement'

const attrsOf = (...args: Parameters<typeof createPageLinkElement>) => {
  const link = createPageLinkElement(...args)
  new Doc().getXmlFragment('default').insert(0, [link as XmlElement])
  return link.getAttributes()
}

test('a synced link carries no title', () => {
  expect(attrsOf(7, 'Escalation', false, true)).toMatchObject({title: '', synced: true})
})

test('a plain link keeps its title', () => {
  expect(attrsOf(7, 'Runbook', false).title).toBe('Runbook')
})

test('a plain link without a title falls back to untitled', () => {
  expect(attrsOf(7, null, false).title).toBe('<Untitled>')
})

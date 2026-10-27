import * as Y from 'yjs'
import {removeClientThinkingBlocks} from '../removeClientThinkingBlocks'

const makeDoc = () => {
  const doc = new Y.Doc()
  const frag = doc.getXmlFragment('default')
  frag.observeDeep((events) => events.forEach(removeClientThinkingBlocks))
  return {doc, frag}
}

const insertThinkingBlock = (origin: object) => {
  const {doc, frag} = makeDoc()
  doc.transact(() => {
    frag.insert(0, [new Y.XmlElement('thinkingBlock')])
  }, origin)
  return frag.toArray().map((node) => (node as Y.XmlElement).nodeName)
}

test('removes a thinkingBlock a client connection adds', () => {
  expect(insertThinkingBlock({source: 'connection', connection: {context: {}}})).toEqual([])
})

test('keeps a thinkingBlock the server adds', () => {
  expect(insertThinkingBlock({source: 'local', context: {}})).toEqual(['thinkingBlock'])
})

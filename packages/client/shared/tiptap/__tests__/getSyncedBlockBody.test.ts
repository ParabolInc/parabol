import {getSyncedBlockBody} from '../getSyncedBlockBody'

const heading = (text: string) => ({
  type: 'heading',
  attrs: {level: 1},
  content: [{type: 'text', text}]
})
const paragraph = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})

test('drops the name heading', () => {
  expect(
    getSyncedBlockBody({type: 'doc', content: [heading('Escalation'), paragraph('Sev 1')]})
  ).toEqual([paragraph('Sev 1')])
})

test("keeps a first node that isn't a heading", () => {
  expect(getSyncedBlockBody({type: 'doc', content: [paragraph('Sev 1')]})).toEqual([
    paragraph('Sev 1')
  ])
})

test('makes canonical page links copies at any depth', () => {
  const link = {type: 'pageLinkBlock', attrs: {pageCode: 7, canonical: true}}
  const doc = {type: 'doc', content: [heading('N'), {type: 'blockquote', content: [link]}]}
  expect(getSyncedBlockBody(doc)).toEqual([
    {type: 'blockquote', content: [{type: 'pageLinkBlock', attrs: {pageCode: 7, canonical: false}}]}
  ])
  expect(link.attrs.canonical).toBe(true)
})

test('leaves one empty paragraph for a block with only its name', () => {
  expect(getSyncedBlockBody({type: 'doc', content: [heading('N')]})).toEqual([{type: 'paragraph'}])
})

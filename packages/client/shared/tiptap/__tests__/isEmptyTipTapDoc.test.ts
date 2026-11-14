import isEmptyTipTapDoc from '../isEmptyTipTapDoc'

const doc = (...content: object[]) => ({type: 'doc', content})
const p = (text?: string) => ({type: 'paragraph', content: text ? [{type: 'text', text}] : []})

test('empty doc, empty paragraph, whitespace and hard breaks are empty', () => {
  expect(isEmptyTipTapDoc(doc())).toBe(true)
  expect(isEmptyTipTapDoc(doc(p()))).toBe(true)
  expect(isEmptyTipTapDoc(doc(p('   ')))).toBe(true)
  expect(isEmptyTipTapDoc(doc({type: 'paragraph', content: [{type: 'hardBreak'}]}))).toBe(true)
})

test('an empty list is empty, nested list text is content', () => {
  const list = (text?: string) => ({
    type: 'bulletList',
    content: [{type: 'listItem', content: [p(text)]}]
  })
  expect(isEmptyTipTapDoc(doc(list()))).toBe(true)
  expect(isEmptyTipTapDoc(doc(list('shipped')))).toBe(false)
})

test('an image-only doc is content', () => {
  expect(isEmptyTipTapDoc(doc({type: 'imageBlock', attrs: {src: 'https://x/y.png'}}))).toBe(false)
})

test('a doc the schema rejects throws', () => {
  expect(() => isEmptyTipTapDoc(doc({type: 'notANode'}))).toThrow()
})

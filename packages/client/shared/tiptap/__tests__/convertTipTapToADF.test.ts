import convertTiptapToADF, {type AdfNode} from '../convertTipTapToADF'

const para = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})
const title = {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'T'}]}
const docOf = (...body: unknown[]) => ({type: 'doc', content: [title, ...body]}) as never

const find = (node: AdfNode, type: string): AdfNode | undefined => {
  if (node.type === type) return node
  for (const c of node.content ?? []) {
    const hit = find(c, type)
    if (hit) return hit
  }
  return undefined
}

test('nested taskList inside an ordered listItem degrades to a prefixed bulletList', () => {
  const adf = convertTiptapToADF(
    docOf({
      type: 'orderedList',
      attrs: {start: 1},
      content: [
        {
          type: 'listItem',
          content: [
            para('First'),
            {
              type: 'taskList',
              content: [{type: 'taskItem', attrs: {checked: false}, content: [para('This is one')]}]
            }
          ]
        },
        {type: 'listItem', content: [para('Second')]}
      ]
    })
  )
  const ol = find(adf, 'orderedList')!
  const li0 = ol.content![0]!
  expect(li0.content![0]!.type).toBe('paragraph')
  const nested = li0.content![1]!
  expect(nested.type).toBe('bulletList')
  const firstPara = nested.content![0]!.content![0]!
  expect(firstPara.content![0]).toEqual({type: 'text', text: '☐ '})
  expect(firstPara.content![1]).toEqual({type: 'text', text: 'This is one'})
})

test('checked task renders ☑ prefix', () => {
  const adf = convertTiptapToADF(
    docOf({
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            para('x'),
            {
              type: 'taskList',
              content: [{type: 'taskItem', attrs: {checked: true}, content: [para('done')]}]
            }
          ]
        }
      ]
    })
  )
  const nestedBullet = find(adf, 'bulletList')!.content![0]!.content![1]!
  const firstPara = nestedBullet.content![0]!.content![0]!
  expect(firstPara.content![0]).toEqual({type: 'text', text: '☑ '})
})

test('nested orderedList inside a listItem recurses (ADF-legal)', () => {
  const adf = convertTiptapToADF(
    docOf({
      type: 'orderedList',
      attrs: {start: 1},
      content: [
        {
          type: 'listItem',
          content: [
            para('First'),
            {
              type: 'orderedList',
              attrs: {start: 1},
              content: [{type: 'listItem', content: [para('sub')]}]
            }
          ]
        }
      ]
    })
  )
  const outer = find(adf, 'orderedList')!
  expect(outer.content![0]!.content![1]!.type).toBe('orderedList')
})

test('flat top-level taskList stays a native ADF taskList', () => {
  const adf = convertTiptapToADF(
    docOf({
      type: 'taskList',
      content: [{type: 'taskItem', attrs: {checked: false}, content: [para('todo')]}]
    })
  )
  const tl = find(adf, 'taskList')
  expect(tl).toBeDefined()
  expect(tl!.content![0]!.type).toBe('taskItem')
})

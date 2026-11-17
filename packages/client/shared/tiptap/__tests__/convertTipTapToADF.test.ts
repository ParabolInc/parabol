import {Editor} from '@tiptap/core'
import {convertADFToTipTap} from '../convertADFToTipTap'
import {type AdfNode, convertTiptapToADF} from '../convertTipTapToADF'
import {serverTipTapExtensions} from '../serverTipTapExtensions'
import type {TipTapSerializedContent} from '../TipTapSerializedContent'

const para = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})
const docOf = (...content: unknown[]) => ({type: 'doc', content}) as TipTapSerializedContent

const find = (node: AdfNode, type: string): AdfNode | undefined => {
  if (node.type === type) return node
  for (const child of node.content ?? []) {
    const hit = find(child, type)
    if (hit) return hit
  }
  return undefined
}

describe('convertTiptapToADF', () => {
  it('converts every block, including the first', () => {
    const adf = convertTiptapToADF({
      type: 'doc',
      content: [
        {type: 'paragraph', content: [{type: 'text', text: 'It wobbles'}]},
        {type: 'paragraph', content: [{type: 'text', text: 'Mostly on mobile'}]}
      ]
    })
    expect(adf).toEqual({
      type: 'doc',
      version: 1,
      content: [
        {type: 'paragraph', content: [{type: 'text', text: 'It wobbles'}]},
        {type: 'paragraph', content: [{type: 'text', text: 'Mostly on mobile'}]}
      ]
    })
  })

  it.each(['sub', 'sup'])('round-trips a %s subsup mark', (scriptType) => {
    const scriptText = {
      type: 'text',
      text: '2',
      marks: [{type: 'subsup', attrs: {type: scriptType}}]
    }
    const adf = {type: 'doc', version: 1, content: [{type: 'paragraph', content: [scriptText]}]}
    expect(convertTiptapToADF(convertADFToTipTap(adf, 'Title')).content?.[1]).toEqual({
      type: 'paragraph',
      content: [scriptText]
    })
  })

  it('exports one subsup mark when superscript is applied over subscript', () => {
    const editor = new Editor({
      element: undefined,
      extensions: serverTipTapExtensions,
      content: {
        type: 'doc',
        content: [
          {type: 'paragraph', content: [{type: 'text', text: 'x2', marks: [{type: 'subscript'}]}]}
        ]
      }
    })
    editor.chain().selectAll().setSuperscript().run()
    const adf = convertTiptapToADF(editor.getJSON() as TipTapSerializedContent)
    editor.destroy()
    expect(adf.content?.[0]).toEqual({
      type: 'paragraph',
      content: [{type: 'text', text: 'x2', marks: [{type: 'subsup', attrs: {type: 'sup'}}]}]
    })
  })

  it('falls back to an empty paragraph because ADF needs one block', () => {
    expect(convertTiptapToADF({type: 'doc', content: []})).toEqual({
      type: 'doc',
      version: 1,
      content: [{type: 'paragraph'}]
    })
  })
})

describe('convertTiptapToADF mixed list nesting', () => {
  it('degrades a taskList inside an ordered listItem to a prefixed bulletList', () => {
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
                content: [
                  {type: 'taskItem', attrs: {checked: false}, content: [para('This is one')]}
                ]
              }
            ]
          },
          {type: 'listItem', content: [para('Second')]}
        ]
      })
    )
    const firstItem = find(adf, 'orderedList')!.content![0]!
    expect(firstItem.content![0]!.type).toBe('paragraph')
    const nested = firstItem.content![1]!
    expect(nested.type).toBe('bulletList')
    expect(nested.content![0]!.content![0]!.content).toEqual([
      {type: 'text', text: '☐ '},
      {type: 'text', text: 'This is one'}
    ])
  })

  it('prefixes a checked task with ☑', () => {
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
    const nested = find(adf, 'bulletList')!.content![0]!.content![1]!
    expect(nested.content![0]!.content![0]!.content![0]).toEqual({type: 'text', text: '☑ '})
  })

  it('keeps an orderedList inside a listItem as a real nested list', () => {
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
    expect(find(adf, 'orderedList')!.content![0]!.content![1]!.type).toBe('orderedList')
  })

  it('turns a heading inside a listItem into a paragraph because ADF list items reject it', () => {
    const adf = convertTiptapToADF(
      docOf({
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              para('First'),
              {type: 'heading', attrs: {level: 2}, content: [{type: 'text', text: 'Sub'}]}
            ]
          }
        ]
      })
    )
    expect(find(adf, 'bulletList')!.content![0]!.content![1]).toEqual({
      type: 'paragraph',
      content: [{type: 'text', text: 'Sub'}]
    })
  })

  it('keeps a flat taskList as a native ADF taskList', () => {
    const adf = convertTiptapToADF(
      docOf({
        type: 'taskList',
        content: [{type: 'taskItem', attrs: {checked: false}, content: [para('todo')]}]
      })
    )
    expect(find(adf, 'taskList')!.content![0]!.type).toBe('taskItem')
  })
})

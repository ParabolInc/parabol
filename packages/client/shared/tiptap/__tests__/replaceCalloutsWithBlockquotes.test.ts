import type {JSONContent} from '@tiptap/core'
import {markdownToTipTap} from '../markdownToTipTap'
import {replaceCalloutsWithBlockquotes} from '../replaceCalloutsWithBlockquotes'

const text = (value: string, marks?: JSONContent['marks']): JSONContent =>
  marks ? {type: 'text', text: value, marks} : {type: 'text', text: value}
const p = (...content: JSONContent[]): JSONContent => ({type: 'paragraph', content})
const callout = (content: JSONContent[]): JSONContent => ({
  type: 'callout',
  attrs: {tone: 'info', emoji: null},
  content
})
const bold = {type: 'bold'}

describe('replaceCalloutsWithBlockquotes', () => {
  test('a titled callout becomes a quote led by its title in bold', () => {
    const titled = callout([
      {type: 'calloutTitle', content: [text('Heads '), text('up', [{type: 'italic'}])]},
      p(text('body'))
    ])
    expect(replaceCalloutsWithBlockquotes([titled])).toEqual([
      {
        type: 'blockquote',
        content: [p(text('Heads ', [bold]), text('up', [{type: 'italic'}, bold])), p(text('body'))]
      }
    ])
  })

  test('an untitled callout becomes a quote of its body', () => {
    expect(replaceCalloutsWithBlockquotes([callout([p(text('a')), p(text('b'))])])).toEqual([
      {type: 'blockquote', content: [p(text('a')), p(text('b'))]}
    ])
  })

  test('a callout nested in a list is replaced in place', () => {
    const list: JSONContent = {
      type: 'bulletList',
      content: [{type: 'listItem', content: [p(text('item')), callout([p(text('inner'))])]}]
    }
    expect(replaceCalloutsWithBlockquotes([list])).toEqual([
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [p(text('item')), {type: 'blockquote', content: [p(text('inner'))]}]
          }
        ]
      }
    ])
  })

  test('keeps an existing bold mark on the title without doubling it', () => {
    const titled = callout([{type: 'calloutTitle', content: [text('Loud', [bold])]}, p()])
    expect(replaceCalloutsWithBlockquotes([titled])[0]?.content?.[0]).toEqual(
      p(text('Loud', [bold]))
    )
  })

  test('leaves no callout in markdown parsed from an alert', () => {
    const content = replaceCalloutsWithBlockquotes(markdownToTipTap('> [!NOTE] Heads up\n> body'))
    expect(JSON.stringify(content)).not.toContain('callout')
    expect(content[0]?.type).toBe('blockquote')
  })
})

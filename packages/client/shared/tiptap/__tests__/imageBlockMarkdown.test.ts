import {Editor, generateText, type JSONContent} from '@tiptap/core'
import {serverTipTapExtensions} from '../serverTipTapExtensions'

const imageBlock = (attrs: Record<string, unknown>): JSONContent => ({type: 'imageBlock', attrs})

const heading = (text: string): JSONContent => ({
  type: 'heading',
  attrs: {level: 1},
  content: [{type: 'text', text}]
})

const toMarkdown = (content: JSONContent[]) =>
  new Editor({
    element: undefined,
    content: {type: 'doc', content},
    extensions: serverTipTapExtensions
  }).getMarkdown()

const fromMarkdown = (markdown: string) => {
  const editor = new Editor({
    element: undefined,
    content: markdown,
    contentType: 'markdown',
    extensions: serverTipTapExtensions
  })
  const doc = editor.getJSON()
  editor.schema.nodeFromJSON(doc).check()
  return doc.content ?? []
}

const textOf = (node: JSONContent): string => node.text ?? (node.content ?? []).map(textOf).join('')

describe('imageBlock markdown', () => {
  test('writes an image as standard markdown', () => {
    expect(toMarkdown([imageBlock({src: 'https://x.test/a.png', alt: 'cat'})])).toBe(
      '![cat](https://x.test/a.png)'
    )
  })

  test('writes the title when there is one', () => {
    expect(toMarkdown([imageBlock({src: 'https://x.test/a.png', alt: 'cat', title: 'T'})])).toBe(
      '![cat](https://x.test/a.png "T")'
    )
  })

  test('escapes brackets in the alt text', () => {
    const markdown = toMarkdown([imageBlock({src: 'https://x.test/a.png', alt: 'a]b'})])
    expect(markdown).toBe('![a\\]b](https://x.test/a.png)')
    expect(fromMarkdown(markdown)[0]?.attrs).toMatchObject({
      src: 'https://x.test/a.png',
      alt: 'a]b'
    })
  })

  test.each(['https://x.test/a b.png', 'https://x.test/a).png'])(
    'wraps the src %s in angle brackets',
    (src) => {
      const markdown = toMarkdown([imageBlock({src, alt: 'cat'})])
      expect(markdown).toBe(`![cat](<${src}>)`)
      expect(fromMarkdown(markdown)[0]?.attrs).toMatchObject({src, alt: 'cat'})
    }
  )

  test('round-trips an image after a heading', () => {
    const src = 'https://x.test/a.png'
    const markdown = toMarkdown([heading('Title'), imageBlock({src, alt: 'cat'})])
    expect(markdown).toBe(`# Title\n\n![cat](${src})`)
    const image = fromMarkdown(markdown).find((node) => node.type === 'imageBlock')
    expect(image?.attrs).toMatchObject({src, alt: 'cat'})
  })

  test('reads an image on its own line as an imageBlock', () => {
    const content = fromMarkdown('# T\n\n![alt](https://x.test/b.png)')
    expect(content.map((node) => node.type)).toEqual(['heading', 'imageBlock'])
    expect(content[1]?.attrs).toMatchObject({src: 'https://x.test/b.png', alt: 'alt'})
  })

  test('splits a paragraph around an image without losing text', () => {
    const content = fromMarkdown('Before ![x](https://x.test/c.png) after')
    expect(content.map((node) => node.type)).toEqual(['paragraph', 'imageBlock', 'paragraph'])
    expect(textOf(content[0]!).trim()).toBe('Before')
    expect(content[1]?.attrs).toMatchObject({src: 'https://x.test/c.png', alt: 'x'})
    expect(textOf(content[2]!).trim()).toBe('after')
  })

  test('keeps several images and the text between them in order', () => {
    const content = fromMarkdown(
      'Start ![one](https://x.test/1.png)\nthen ![two](https://x.test/2.png)'
    )
    expect(content.map((node) => node.type)).toEqual([
      'paragraph',
      'imageBlock',
      'paragraph',
      'imageBlock'
    ])
    expect(textOf(content[0]!).trim()).toBe('Start')
    expect(content[1]?.attrs?.src).toBe('https://x.test/1.png')
    expect(textOf(content[2]!).trim()).toBe('then')
    expect(content[3]?.attrs?.src).toBe('https://x.test/2.png')
  })

  test.each([
    ['a list item', '- ![x](https://x.test/d.png)', 'https://x.test/d.png'],
    ['a table cell', '| Image |\n| --- |\n| ![x](https://x.test/e.png) |', 'https://x.test/e.png'],
    ['a pipe-delimited line', '| ![x](https://x.test/e.png) |', 'https://x.test/e.png'],
    ['a heading', '# Title ![x](https://x.test/f.png)', 'https://x.test/f.png']
  ])('keeps an image in %s as valid content', (_place, markdown, src) => {
    expect(JSON.stringify(fromMarkdown(markdown))).toContain(src)
  })

  test('keeps a linked image as a link to its target', () => {
    const content = fromMarkdown('See [![badge](https://x.test/badge.png)](https://x.test/ci) here')
    expect(JSON.stringify(content)).toContain('https://x.test/ci')
  })

  test.each([
    ':::imageBlock {src="https://x.test/g.png" alt="g"}\n\n:::',
    ':::imageBlock {[g](https://x.test/g.png)}\n\n:::'
  ])('reads the legacy form %s', (markdown) => {
    const [image] = fromMarkdown(markdown)
    expect(image?.type).toBe('imageBlock')
    expect(image?.attrs).toMatchObject({src: 'https://x.test/g.png', alt: 'g'})
  })

  test.each([
    ['a backslash before a closing angle bracket', 'https://x.test/a\\>b.png'],
    ['a backslash and a space', 'https://x.test/a b\\c.png'],
    ['a backslash and no other special', 'https://x.test/a\\*b.png']
  ])('round-trips a src with %s', (_name, src) => {
    const markdown = toMarkdown([imageBlock({src, alt: 'x'})])
    const content = fromMarkdown(markdown)
    expect(content.map((node) => node.type)).toEqual(['imageBlock'])
    expect(content[0]?.attrs?.src).toBe(src)
  })

  test('keeps a src with a newline on one line as a single image', () => {
    const markdown = toMarkdown([imageBlock({src: 'https://x.test/a\nb.png', alt: 'x'})])
    expect(markdown.trim().split('\n')).toHaveLength(1)
    const content = fromMarkdown(markdown)
    expect(content.map((node) => node.type)).toEqual(['imageBlock'])
    expect(content[0]?.attrs?.src).toBe('https://x.test/a%0Ab.png')
  })

  test('reads plain text from an image without a src', () => {
    const doc = {type: 'doc', content: [imageBlock({src: null})]}
    expect(() => generateText(doc, serverTipTapExtensions)).not.toThrow()
  })
})

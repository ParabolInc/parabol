import {getSchema, type JSONContent} from '@tiptap/core'
import {linkDisallowedImages} from '../linkDisallowedImages'
import {markdownToTipTap} from '../markdownToTipTap'
import {serverTipTapExtensions} from '../serverTipTapExtensions'

const schema = getSchema(serverTipTapExtensions)

const checkValid = (content: JSONContent[]) => schema.nodeFromJSON({type: 'doc', content}).check()

const collect = (content: JSONContent[]): JSONContent[] =>
  content.flatMap((node) => [node, ...collect(node.content ?? [])])

const imageBlocks = (content: JSONContent[]) =>
  collect(content).filter((node) => node.type === 'imageBlock')

const firstListItemTypes = (content: JSONContent[]) =>
  content[0]?.content?.[0]?.content?.map((node) => node.type)

const linkHrefs = (content: JSONContent[]) =>
  collect(content).flatMap((node) =>
    (node.marks ?? []).filter((mark) => mark.type === 'link').map((mark) => mark.attrs?.href)
  )

describe('linkDisallowedImages', () => {
  test.each([
    ['standard', '![x](https://attacker.test/a.png?q=s)', 'https://attacker.test/a.png?q=s'],
    [
      'legacy',
      ':::imageBlock {src="https://attacker.test/b.png"}\n\n:::',
      'https://attacker.test/b.png'
    ],
    ['list item', '- ![x](https://attacker.test/c.png)\n\n- y', 'https://attacker.test/c.png'],
    [
      'table cell',
      '| Image |\n| --- |\n| ![x](https://attacker.test/d.png) |',
      'https://attacker.test/d.png'
    ],
    ['blockquote', '> ![x](https://attacker.test/e.png)', 'https://attacker.test/e.png']
  ])('turns a %s image into a link by default', (_form, markdown, src) => {
    const content = markdownToTipTap(markdown)
    expect(imageBlocks(content)).toEqual([])
    expect(linkHrefs(content)).toContain(src)
    expect(() => checkValid(content)).not.toThrow()
  })

  test('keeps images the caller allows', () => {
    const content = markdownToTipTap('![x](https://x.test/a.png)', {isAllowedImageSrc: () => true})
    expect(imageBlocks(content).map((node) => node.attrs?.src)).toEqual(['https://x.test/a.png'])
    expect(() => checkValid(content)).not.toThrow()
  })

  test('keeps an allowed image that starts a list item, after an empty paragraph', () => {
    const content = markdownToTipTap('1. ![x](https://x.test/a.png)', {
      isAllowedImageSrc: () => true
    })
    expect(() => checkValid(content)).not.toThrow()
    expect(firstListItemTypes(content)).toEqual(['paragraph', 'imageBlock'])
  })

  test('links a disallowed image that starts a list item without adding an empty paragraph', () => {
    const content = markdownToTipTap('1. ![x](https://attacker.test/a.png)')
    expect(() => checkValid(content)).not.toThrow()
    expect(firstListItemTypes(content)).toEqual(['paragraph'])
    expect(linkHrefs(content)).toEqual(['https://attacker.test/a.png'])
  })

  test('converts an image nested in a table cell', () => {
    const cell = (content: JSONContent[]): JSONContent => ({type: 'tableCell', content})
    const content = linkDisallowedImages(
      [
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                cell([{type: 'imageBlock', attrs: {src: 'https://attacker.test/f.png', alt: 'f'}}])
              ]
            }
          ]
        }
      ],
      () => false
    )
    expect(imageBlocks(content)).toEqual([])
    expect(linkHrefs(content)).toEqual(['https://attacker.test/f.png'])
    expect(() => checkValid(content)).not.toThrow()
  })

  test('writes plain text for a src that is not a safe link', () => {
    const content = markdownToTipTap(':::imageBlock {src="javascript:alert(1)" alt="x"}\n\n:::')
    expect(imageBlocks(content)).toEqual([])
    expect(linkHrefs(content)).toEqual([])
    expect(content).toEqual([{type: 'paragraph', content: [{type: 'text', text: 'x'}]}])
  })

  test.each(['> ![]()', '- ![]()', '![]()'])(
    'keeps the doc valid when %s has no src',
    (markdown) => {
      const content = markdownToTipTap(markdown)
      expect(imageBlocks(content)).toEqual([])
      expect(() => checkValid(content)).not.toThrow()
    }
  )
})

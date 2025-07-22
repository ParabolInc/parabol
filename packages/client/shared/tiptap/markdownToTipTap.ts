// This returns a Content array of blocks, not a whole JSONContent.
// If you need the whole doc, wrap it like {type: 'doc', content: <RETURN VALUE>}

import {Editor, type JSONContent} from '@tiptap/core'
import {MarkdownParser} from '@tiptap/pm/markdown'
import markdownit from 'markdown-it'
import {serverTipTapExtensions} from './serverTipTapExtensions'

// No table support yet!
let parser: MarkdownParser

const getParser = () => {
  if (!parser) {
    const editor = new Editor({
      element: undefined,
      content: {type: 'doc', content: []},
      extensions: serverTipTapExtensions
    })

    const md = markdownit({
      html: true,
      linkify: true
    })

    parser = new MarkdownParser(editor.schema, md as any, {
      blockquote: {block: 'blockquote'},
      paragraph: {block: 'paragraph'},
      list_item: {block: 'listItem'},
      ordered_list: {block: 'orderedList', getAttrs: (t) => ({order: +t.attrGet('order')! || 1})},
      bullet_list: {block: 'bulletList'},
      heading: {block: 'heading', getAttrs: (t) => ({level: +t.tag.slice(1)})},
      code_block: {block: 'codeBlock'},
      fence: {block: 'codeBlock', getAttrs: (t) => ({language: t.info || null})},
      hr: {node: 'horizontalRule'},
      image: {
        node: 'imageBlock',
        getAttrs: (t) => ({
          src: t.attrGet('src'),
          alt: t.attrGet('alt')
        })
      },
      hardbreak: {node: 'hardBreak'},
      em: {mark: 'italic'},
      strong: {mark: 'bold'},
      link: {
        mark: 'link',
        getAttrs: (t) => ({
          href: t.attrGet('href'),
          title: t.attrGet('title')
        })
      },
      code_inline: {mark: 'code'}
    })
  }
  return parser
}
export const markdownToTipTap = (str: string) => {
  const parser = getParser()
  const parsed = parser.parse(str)
  // remove constructors
  return JSON.parse(JSON.stringify(parsed.content)) as JSONContent[]
}

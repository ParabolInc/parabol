import {Extension} from '@tiptap/core'

export const ImageMarkdownBase = Extension.create({
  name: 'imageMarkdown',
  markdownTokenName: 'image',
  parseMarkdown: (token, helpers) => {
    const label = token.text || token.href
    if (!label) return []
    return helpers.applyMark('link', [helpers.createTextNode(label)], {href: token.href})
  }
})

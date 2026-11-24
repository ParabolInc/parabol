import type {JSONContent} from '@tiptap/core'
import {isAllowedLinkHref} from './isAllowedLinkHref'

const toLinkedText = (src: string, alt: unknown): JSONContent => ({
  type: 'paragraph',
  content: [
    {
      type: 'text',
      text: typeof alt === 'string' && alt ? alt : src,
      marks: isAllowedLinkHref(src) ? [{type: 'link', attrs: {href: src}}] : undefined
    }
  ]
})

export const linkDisallowedImages = (
  content: JSONContent[],
  isAllowedImageSrc: (src: string) => boolean
): JSONContent[] =>
  content.flatMap((node) => {
    if (node.type !== 'imageBlock') {
      return node.content
        ? [{...node, content: linkDisallowedImages(node.content, isAllowedImageSrc)}]
        : [node]
    }
    const src: unknown = node.attrs?.src
    if (typeof src !== 'string' || !src) return [{type: 'paragraph'}]
    return isAllowedImageSrc(src) ? [node] : [toLinkedText(src, node.attrs?.alt)]
  })

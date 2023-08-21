import {Node} from '@tiptap/core'
import {JSONContent, mergeAttributes} from '@tiptap/react'

const LOOM_REGEX = /^(?:https?:\/\/)?(?:www\.)?loom\.com\/share\/[a-zA-Z0-9]+/g

export const unfurlLoomLinks = (rawContent: JSONContent): JSONContent => {
  if (!rawContent.content) {
    return rawContent
  }

  const newContent: JSONContent[] = []
  rawContent.content.forEach((content) => {
    if (content.type === 'paragraph') {
      newContent.push(content, ...getLoomNodesForParagraph(content))
    } else {
      newContent.push(unfurlLoomLinks(content))
    }
  })

  return {
    type: rawContent.type,
    content: newContent
  }
}

const getLoomNodesForParagraph = (content: JSONContent) => {
  const distinctLoomLinks: Record<string, string> = {}
  content.content?.forEach((subContent) => {
    if (subContent.type === 'text') {
      const link = subContent.marks?.find((mark) => mark.type === 'link')
      if (!link) {
        return
      }

      if (link.attrs?.href.match(LOOM_REGEX)) {
        const linkKey = link.attrs.href.split('?')[0]
        if (!distinctLoomLinks[linkKey]) {
          distinctLoomLinks[linkKey] = link.attrs.href
        }
      }
    }
  })

  return Object.values(distinctLoomLinks).map((link) => {
    return {
      type: 'loom',
      attrs: {
        src: link
      }
    }
  })
}

export const LoomExtension = Node.create({
  name: 'loom',

  group: 'block',
  inline: false,

  addAttributes() {
    return {
      src: {
        default: null
      }
    }
  },

  renderHTML(props) {
    const {HTMLAttributes} = props
    const components = HTMLAttributes.src.split('/')
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        style: 'position: relative; padding-bottom: 75%; height: 0; margin: 8px 0px;'
      }),
      [
        'iframe',
        {
          src: `https://www.loom.com/embed/${components[components.length - 1]}`,
          style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;',
          frameborder: '0',
          webkitallowfullscreen: true,
          mozallowfullscreen: true,
          allowfullscreen: true
        }
      ]
    ]
  }
})

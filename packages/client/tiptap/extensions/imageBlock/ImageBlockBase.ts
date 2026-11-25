import {
  createBlockMarkdownSpec,
  type JSONContent,
  mergeAttributes,
  type NodeConfig,
  parseAttributes
} from '@tiptap/core'
import {Image} from '@tiptap/extension-image'

export interface ImageBlockStorage {
  editorWidth: number
  editorHeight: number
  expandButton: boolean
}

declare module '@tiptap/core' {
  interface Storage {
    imageBlock: ImageBlockStorage
  }
  interface Commands<ReturnType> {
    imageBlock: {
      setImageBlock: (attributes: {src: string; pos?: number | Range}) => ReturnType
      setImageBlockAlign: (align: 'left' | 'center' | 'right') => ReturnType
      setImageBlockWidth: (width: number) => ReturnType
    }
  }
}

const parseLegacyImageAttributes = (attrString: string) => {
  const link = attrString.trim().match(/^\[(.*)\]\((.*)\)$/)
  return link ? {alt: link[1] || null, src: link[2]} : parseAttributes(attrString)
}

const renderImageMarkdown = (node: JSONContent) => {
  const {src, alt, title} = node.attrs ?? {}
  const label = (alt ?? '').replace(/[\\[\]]/g, '\\$&')
  const source: string = src ?? ''
  const href = source.replace(/\r/g, '%0D').replace(/\n/g, '%0A')
  const destination = /[\s()<>]/.test(href)
    ? `<${href.replace(/[\\<>]/g, '\\$&')}>`
    : href.replace(/\\/g, '\\$&')
  const titleSuffix = title ? ` "${title.replace(/["\\]/g, '\\$&')}"` : ''
  return `![${label}](${destination}${titleSuffix})`
}

export const ImageBlockBase = Image.extend<ImageBlockStorage, ImageBlockStorage>({
  name: 'imageBlock',

  group: 'block',

  defining: true,

  isolating: true,

  addOptions() {
    return {
      editorWidth: 300,
      editorHeight: 112,
      expandButton: false
    }
  },

  addStorage(this) {
    return {
      editorWidth: this.options.editorWidth,
      editorHeight: this.options.editorHeight,
      expandButton: this.options.expandButton
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]:not([src^="data:"])'
      }
    ]
  },
  renderText({node}) {
    const src = node.attrs.src as string | null
    return src ? `\n<<${src.split('/').pop()}>>\n` : ''
  },
  renderHTML({HTMLAttributes}) {
    const align = HTMLAttributes['data-align']
    const justify = align === 'left' ? 'start' : align === 'right' ? 'end' : 'center'
    return [
      'div',
      {style: `width: 100%; display: flex; justify-content: ${justify};`},
      ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
    ]
  },
  ...createBlockMarkdownSpec({
    nodeName: 'imageBlock',
    parseAttributes: parseLegacyImageAttributes
  }),
  renderMarkdown: renderImageMarkdown
  // TipTap v3 got some types wrong, this cast shouldn't be necessary
} as NodeConfig)

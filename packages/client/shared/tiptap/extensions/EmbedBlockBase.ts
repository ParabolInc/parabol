import {createBlockMarkdownSpec, mergeAttributes, Node, type NodeConfig} from '@tiptap/core'
import {isAllowedEmbedHost} from '../../embed/curatedEmbedProviders'
import type {
  EmbedAspectRatio,
  EmbedBlockAttrs,
  EmbedBlockProviderAttrs
} from '../../embed/embedTypes'
import {toSafeHref} from '../../embed/normalizeEmbedUrl'

export type {EmbedBlockAttrs}

export const ASPECT_RATIO_PADDING: Record<EmbedAspectRatio, string> = {
  '16:9': '56.25%',
  '4:3': '75%',
  '1:1': '100%',
  tall: '133.33%'
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embedBlock: {
      setEmbedBlock: (attributes?: {url?: string; pos?: number}) => ReturnType
      setEmbedBlockAlign: (align: 'left' | 'center' | 'right') => ReturnType
      setEmbedBlockWidth: (width: number) => ReturnType
      setEmbedBlockFullWidth: (isFullWidth: boolean) => ReturnType
      setEmbedBlockDisplayMode: (displayMode: 'embed' | 'card') => ReturnType
      setEmbedBlockAspectRatio: (aspectRatio: EmbedAspectRatio) => ReturnType
      setEmbedBlockMetadata: (metadata: EmbedBlockProviderAttrs) => ReturnType
    }
  }
}

const stringAttr = (name: string, dataName: string, fallback: unknown = undefined) => ({
  default: fallback,
  parseHTML: (element: HTMLElement) => element.getAttribute(dataName) ?? fallback,
  renderHTML: (attributes: Record<string, any>) =>
    attributes[name] ? {[dataName]: attributes[name]} : {}
})

export const EmbedBlockBase = Node.create({
  name: 'embedBlock',

  group: 'block',

  atom: true,

  defining: true,

  isolating: true,

  draggable: true,

  selectable: true,

  inline: false,

  addAttributes() {
    return {
      url: stringAttr('url', 'data-url', ''),
      displayMode: stringAttr('displayMode', 'data-display-mode', 'embed'),
      align: stringAttr('align', 'data-align', 'center'),
      aspectRatio: stringAttr('aspectRatio', 'data-aspect-ratio', '16:9'),
      embedSrc: stringAttr('embedSrc', 'data-embed-src'),
      title: stringAttr('title', 'data-title'),
      description: stringAttr('description', 'data-description'),
      thumbnailUrl: stringAttr('thumbnailUrl', 'data-thumbnail-url'),
      faviconUrl: stringAttr('faviconUrl', 'data-favicon-url'),
      providerName: stringAttr('providerName', 'data-provider-name'),
      authorName: stringAttr('authorName', 'data-author-name'),
      fetchedAt: stringAttr('fetchedAt', 'data-fetched-at'),
      width: {
        default: undefined,
        parseHTML: (element: HTMLElement) => {
          const raw = element.getAttribute('data-width')
          const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN
          return Number.isFinite(parsed) ? parsed : undefined
        },
        renderHTML: (attributes: Record<string, any>) =>
          attributes.width ? {'data-width': String(attributes.width)} : {}
      },
      isFullWidth: {
        default: false,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-full-width') === 'true',
        renderHTML: (attributes: Record<string, any>) =>
          attributes.isFullWidth ? {'data-full-width': 'true'} : {}
      }
    }
  },

  parseHTML() {
    return [{tag: `div[data-type="${this.name}"]`}]
  },

  renderText({node}) {
    const {title, url} = node.attrs as EmbedBlockAttrs
    return `\n${title ? `${title}: ` : ''}${url}\n`
  },

  // Consumed by HTML, markdown and Confluence export, so it must always render
  // something a reader can follow. An unresolved embed still yields a link.
  renderHTML({HTMLAttributes, node}) {
    const {url, title, embedSrc, displayMode, align, aspectRatio} = node.attrs as EmbedBlockAttrs
    const justify = align === 'left' ? 'start' : align === 'right' ? 'end' : 'center'
    const attrs = mergeAttributes(HTMLAttributes, {'data-type': 'embedBlock'})
    const canFrame = displayMode === 'embed' && isAllowedEmbedHost(embedSrc)
    if (!canFrame) {
      const href = toSafeHref(url)
      const label = title || url
      if (!href) return ['div', attrs, label]
      return ['div', attrs, ['a', {href, target: '_blank', rel: 'noopener noreferrer'}, label]]
    }
    const padding = ASPECT_RATIO_PADDING[aspectRatio] ?? ASPECT_RATIO_PADDING['16:9']
    return [
      'div',
      mergeAttributes(attrs, {
        style: `width: 100%; display: flex; justify-content: ${justify};`
      }),
      [
        'div',
        {style: `position: relative; width: 100%; padding-bottom: ${padding}; height: 0;`},
        [
          'iframe',
          {
            src: embedSrc!,
            title: title || url,
            style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;',
            loading: 'lazy',
            referrerpolicy: 'strict-origin-when-cross-origin',
            sandbox: 'allow-scripts allow-same-origin allow-popups allow-presentation allow-forms',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture',
            allowfullscreen: 'true'
          }
        ]
      ]
    ]
  },
  ...createBlockMarkdownSpec({
    nodeName: 'embedBlock',
    allowedAttributes: [
      'url',
      'displayMode',
      'align',
      'aspectRatio',
      'isFullWidth',
      'embedSrc',
      'thumbnailUrl',
      'faviconUrl',
      'providerName'
    ]
  })
  // TipTap v3 got some types wrong, this cast shouldn't be necessary
} as NodeConfig)

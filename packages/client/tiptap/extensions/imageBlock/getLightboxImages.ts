import type {Node} from '@tiptap/pm/model'
import {isLoadableEmbedSrc} from '../fileBlock/isLoadableEmbedSrc'
import type {LightboxImage} from './ImageLightbox'

export const OPEN_IMAGE_LIGHTBOX_META = 'openImageLightbox'

export const getLightboxImages = (doc: Node, currentPos: number) => {
  const images: LightboxImage[] = []
  let startIndex = 0
  doc.descendants((node, pos) => {
    if (node.type.name !== 'imageBlock') return true
    const {src, alt} = node.attrs
    if (typeof src === 'string' && isLoadableEmbedSrc(src)) {
      if (pos === currentPos) startIndex = images.length
      images.push({src, alt: alt || undefined})
    }
    return false
  })
  return {images, startIndex}
}

import * as Y from 'yjs'

const isEmptyParagraph = (node: ReturnType<Y.XmlFragment['get']> | undefined) =>
  node instanceof Y.XmlElement && node.nodeName === 'paragraph' && node.length === 0

export const getFragmentAppendIndex = (frag: Y.XmlFragment) => {
  const last = frag.length > 0 ? frag.get(frag.length - 1) : undefined
  return frag.length > 1 && isEmptyParagraph(last) ? frag.length - 1 : frag.length
}

import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import {XmlElement, XmlText} from 'yjs'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'

export const toYXmlNodes = (content: JSONContent[]): (XmlElement | XmlText)[] =>
  TiptapTransformer.toYdoc({type: 'doc', content}, 'default', serverTipTapExtensions)
    .getXmlFragment('default')
    .toArray()
    .filter((node) => node instanceof XmlElement || node instanceof XmlText)

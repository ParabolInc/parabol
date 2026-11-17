import type {JSONContent} from '@tiptap/core'
import {getPlaintextFromTipTap} from '../../utils/tiptap/getPlaintextFromTipTap'

export interface Fixture {
  key: string
  title: string
  plaintextContent: string
  content: JSONContent
  updatedAt?: Date
}

const toFixture = (key: string, content: JSONContent, updatedAt?: Date): Fixture => {
  const {title, plaintextContent} = getPlaintextFromTipTap(content)
  return {key, title, plaintextContent, content, updatedAt}
}

export default toFixture

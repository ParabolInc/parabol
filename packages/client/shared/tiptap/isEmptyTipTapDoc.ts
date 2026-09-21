import {getSchema, isNodeEmpty, type JSONContent} from '@tiptap/core'
import {Node} from '@tiptap/pm/model'
import {serverTipTapExtensions} from './serverTipTapExtensions'

const schema = getSchema(serverTipTapExtensions)

const isEmptyTipTapDoc = (doc: JSONContent) =>
  isNodeEmpty(Node.fromJSON(schema, doc), {ignoreWhitespace: true})

export default isEmptyTipTapDoc

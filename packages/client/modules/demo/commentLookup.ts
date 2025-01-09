import {generateJSON} from '@tiptap/core'
import {serverTipTapExtensions} from '../../shared/tiptap/serverTipTapExtensions'

const commentLookup = {
  botRef6: [
    JSON.stringify(generateJSON('<p>We could make our standups async?</p>', serverTipTapExtensions))
  ]
} as const

export default commentLookup

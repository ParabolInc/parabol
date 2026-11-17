import {TiptapTransformer} from '@hocuspocus/transformer'
import StarterKit from '@tiptap/starter-kit'
import {encodeStateAsUpdate} from 'yjs'

// Seed a heading so child page links can be inserted at position 1, which is out of range in an empty doc
export const getEmptyPageDocState = () => {
  const yDoc = TiptapTransformer.toYdoc(
    {
      type: 'doc',
      content: [{type: 'heading', attrs: {level: 1}, content: []}]
    },
    undefined,
    [StarterKit]
  )
  return encodeStateAsUpdate(yDoc)
}

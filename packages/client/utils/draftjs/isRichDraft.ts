import {EditorState} from 'draft-js'

const isRichDraft = (editorState: EditorState) => {
  const content = editorState.getCurrentContent()
  return !content.getBlockMap().every((block) => {
    if (!block) return false
    if ((block as any).get('type') !== 'unstyled') return false
    const charList = block.getCharacterList()
    return charList.every((char) => {
      if (!char) return false
      return char.getStyle().size === 0 && !char.getEntity()
    })
  })
}

export default isRichDraft

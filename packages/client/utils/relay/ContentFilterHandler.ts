/*
 * Cache the content's text for faster searches
 */
import extractTextFromDraftString from '../draftjs/extractTextFromDraftString'

const ContentTextHandler = {
  update(store, payload) {
    const record = store.get(payload.dataID)
    if (!record) return
    const content = record.getValue(payload.fieldKey)
    const fullText = extractTextFromDraftString(content)
    record.setValue(fullText, 'contentText')
  }
}

export default ContentTextHandler

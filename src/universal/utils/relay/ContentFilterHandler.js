/*
 * Cache the content's text for faster searches
 */
const ContentTextHandler = {
  update(store, payload) {
    const record = store.get(payload.dataID);
    if (!record) return;
    const content = record.getValue(payload.fieldKey);
    const parsedContent = JSON.parse(content);
    const textBlocks = parsedContent.blocks.map(({text}) => text);
    const fullText = textBlocks.join('\n');
    record.setValue(fullText, 'contentText');
    // record.setValue(content, payload.handleKey);
  }
};

export default ContentTextHandler;

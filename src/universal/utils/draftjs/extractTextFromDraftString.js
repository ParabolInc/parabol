const extractTextFromDraftString = (content) => {
  const parsedContent = JSON.parse(content)
  const textBlocks = parsedContent.blocks.map(({text}) => text)
  return textBlocks.join('\n')
}

export default extractTextFromDraftString

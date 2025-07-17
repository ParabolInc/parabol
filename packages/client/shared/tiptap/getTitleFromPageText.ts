export const getTitleFromPageText = (docText: string) => {
  const delimiter = '\n\n'
  const titleBreakIdx = docText.indexOf(delimiter)
  const safeTitleBreakIdx = titleBreakIdx === -1 ? docText.length : titleBreakIdx
  const title = docText.slice(0, safeTitleBreakIdx).slice(0, 255)
  return {title, contentStartsAt: safeTitleBreakIdx + delimiter.length}
}

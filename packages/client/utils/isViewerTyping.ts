const isViewerTyping = () => {
  const activeElement = document.activeElement as HTMLElement
  return activeElement.contentEditable === 'true'
}

export default isViewerTyping

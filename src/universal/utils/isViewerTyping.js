const isViewerTyping = () => {
  return document.activeElement.contentEditable === 'true'
}

export default isViewerTyping

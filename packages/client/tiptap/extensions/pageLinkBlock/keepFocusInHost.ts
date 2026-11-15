const heldBlocks = new WeakSet<HTMLElement>()

// Chrome moves focus into a nested editor when the host selection starts between two uneditable blocks.
// Making the block editable while the host writes its selection keeps focus in the host
// (ProseMirror's temporarilyEditableNear does the same for Safari).
export const keepFocusInHost = (blockDom: Node | null) => {
  if (!(blockDom instanceof HTMLElement) || heldBlocks.has(blockDom)) return
  if (!blockDom.querySelector('[data-synced-editor]')) return
  const {contentEditable} = blockDom
  heldBlocks.add(blockDom)
  blockDom.contentEditable = 'true'
  queueMicrotask(() => {
    blockDom.contentEditable = contentEditable
    heldBlocks.delete(blockDom)
  })
}

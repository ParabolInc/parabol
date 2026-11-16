export const isInSyncedBlockContent = (
  target: EventTarget | null,
  root: Node,
  selector = '[data-synced-editor], [data-synced-chrome]'
) => {
  const owner = target instanceof Element ? target.closest(selector) : null
  return !!owner && root.contains(owner)
}

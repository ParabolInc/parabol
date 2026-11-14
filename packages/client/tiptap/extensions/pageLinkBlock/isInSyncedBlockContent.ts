export const isInSyncedBlockContent = (target: EventTarget | null, root: Element) => {
  const owner =
    target instanceof Element ? target.closest('[data-synced-editor], [data-synced-chrome]') : null
  return !!owner && root.contains(owner)
}

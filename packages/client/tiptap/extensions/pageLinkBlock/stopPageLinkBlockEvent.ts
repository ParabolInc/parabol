export const stopPageLinkBlockEvent = (event: Event, dom: HTMLElement) => {
  const {target} = event
  const owner =
    target instanceof Element ? target.closest('[data-synced-editor], [data-synced-chrome]') : null
  if (owner && dom.contains(owner)) return true
  // only the drag handle may drag the node, so a mousedown on the node never starts one
  return event.type === 'mousedown'
}

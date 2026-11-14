export const getSyncedBlockEventTarget = (wrapper: HTMLElement) =>
  wrapper.closest('.react-renderer') ?? wrapper

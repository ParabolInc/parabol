import type {BlockMoveResult} from './moveBlocksToPage'

export const getBlockMoveMessage = (result: BlockMoveResult, count: number, title: string) => {
  const blocks = count === 1 ? '1 block' : `${count} blocks`
  switch (result) {
    case 'moved':
      return `Moved ${blocks} to ${title}`
    case 'copied':
      return count === 1
        ? `Copied ${blocks} to ${title}. Someone was editing it, so the original stayed here.`
        : `Copied ${blocks} to ${title}. Someone was editing them, so the originals stayed here.`
    case 'offline':
      return 'Couldn’t move: you’re offline. Nothing changed.'
    case 'readonly':
      return `Couldn’t move: you can only view ${title}. Nothing changed.`
    case 'streaming':
      return `Couldn’t move: ${title} is still being written. Nothing changed.`
    case 'unsaved':
      return `Couldn’t move: ${title} didn’t save in time. Nothing changed.`
    case 'gone':
      return null
  }
}

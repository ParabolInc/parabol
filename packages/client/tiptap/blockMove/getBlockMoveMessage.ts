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

export const getBlockMoveUndoMessage = (removed: number, kept: number, title: string) => {
  const total = removed + kept
  if (removed === 0) {
    return total === 1
      ? `That block was edited on ${title}, so it stayed there.`
      : `Those blocks were edited on ${title}, so they stayed there.`
  }
  const keptClause =
    kept === 1
      ? `One was edited on ${title}, so it stayed there.`
      : `${kept} were edited on ${title}, so they stayed there.`
  return `Moved back ${removed} of ${total} blocks. ${keptClause}`
}

export const getBlockMoveUnreachableUndoMessage = (title: string) =>
  `Moved back here. ${title} couldn’t be reached, so the copy there stayed.`

export const getBlockMoveUnrestorableMessage = (count: number, title: string) =>
  count === 1
    ? `Couldn’t move it back here, so it stayed on ${title}.`
    : `Couldn’t move them back here, so they stayed on ${title}.`

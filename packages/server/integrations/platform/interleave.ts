import {isNotNull} from 'parabol-client/utils/predicates'

/** Round-robin merge: the first item of every list, then the second of every list, … */
const interleave = <T>(lists: T[][]): T[] => {
  const longest = Math.max(0, ...lists.map((list) => list.length))
  return Array.from({length: longest}).flatMap((_, idx) =>
    lists.map((list) => list[idx]).filter(isNotNull)
  )
}

export default interleave

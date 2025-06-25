export type LCSDiffResult<T> = {
  moved: {id: T; fromIndex: number; toIndex: number}[]
  removed: T[]
  added: T[]
}

export function diffByLCS<T>(before: T[], after: T[]): LCSDiffResult<T> | null {
  if (before.length === 0 && after.length === 0) return null
  if (before.length === after.length) {
    let same = true
    for (let i = 0; i < before.length; i++) {
      if (before[i] !== after[i]) {
        same = false
        break
      }
    }
    if (same) return null
  }
  const beforeSet = new Set(before)
  const afterSet = new Set(after)

  const sharedBefore: T[] = []
  const removed: T[] = []
  const sharedAfter: T[] = []
  const added: T[] = []

  for (let i = 0; i < before.length; i++) {
    const item = before[i]!
    const arr = afterSet.has(item) ? sharedBefore : removed
    arr.push(item)
  }

  for (let i = 0; i < after.length; i++) {
    const item = after[i]!
    const arr = beforeSet.has(item) ? sharedAfter : added
    arr.push(item)
  }

  const lcs = computeLCS(sharedBefore, sharedAfter)
  const lcsSet = new Set(lcs)

  const moved: LCSDiffResult<T>['moved'] = []
  for (const id of sharedBefore) {
    if (!lcsSet.has(id)) {
      moved.push({
        id,
        fromIndex: before.indexOf(id),
        toIndex: after.indexOf(id)
      })
    }
  }
  return {moved, removed, added}
}

function computeLCS<T>(a: T[], b: T[]): T[] {
  const dp: number[][] = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(0))

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if (a[i] === b[j]) {
        dp[i + 1]![j + 1] = dp[i]![j]! + 1
      } else {
        dp[i + 1]![j + 1] = Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!)
      }
    }
  }

  const result: T[] = []
  let i = a.length
  let j = b.length
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.unshift(a[i - 1]!)
      i--
      j--
    } else if (dp[i - 1]![j]! > dp[i]![j - 1]!) {
      i--
    } else {
      j--
    }
  }

  return result
}

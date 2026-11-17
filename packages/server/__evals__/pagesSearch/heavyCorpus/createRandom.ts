const createRandom = (seed: number) => {
  let state = seed >>> 0
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let mixed = state
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1)
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1))
  const pick = <T>(items: readonly T[]) => items[Math.floor(next() * items.length)]!
  const chance = (probability: number) => next() < probability
  const shuffle = <T>(items: readonly T[]) => {
    const shuffled = [...items]
    for (let index = shuffled.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(next() * (index + 1))
      ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!]
    }
    return shuffled
  }
  return {next, int, pick, chance, shuffle}
}

export type Random = ReturnType<typeof createRandom>

export default createRandom

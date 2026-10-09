interface ThreadCard {
  id: string
  anchorTop: number
  height: number
}

// Every card wants to sit next to the text it is anchored to. Cards that would overlap are
// spread out, and the cards above the active one make room so it stays next to its text
export const layoutThreadCards = (cards: ThreadCard[], activeId: string | null, gap: number) => {
  const sortedCards = [...cards].sort((a, b) => a.anchorTop - b.anchorTop)
  const tops = sortedCards.map(({anchorTop}) => Math.max(0, Math.round(anchorTop)))
  const activeIdx = sortedCards.findIndex(({id}) => id === activeId)
  for (let idx = activeIdx - 1; idx >= 0; idx--) {
    tops[idx] = Math.min(tops[idx]!, tops[idx + 1]! - sortedCards[idx]!.height - gap)
  }
  if (tops.length > 0) tops[0] = Math.max(0, tops[0]!)
  for (let idx = 1; idx < tops.length; idx++) {
    tops[idx] = Math.max(tops[idx]!, tops[idx - 1]! + sortedCards[idx - 1]!.height + gap)
  }
  return Object.fromEntries(sortedCards.map(({id}, idx) => [id, tops[idx]!]))
}

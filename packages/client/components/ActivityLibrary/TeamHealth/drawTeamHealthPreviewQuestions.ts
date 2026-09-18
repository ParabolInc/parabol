// FNV-1a over the string, scaled to [0, 1). Seeded rather than Math.random so a draw stays put
// across re-renders and only changes when the seed does or a category's pool changes
const seededFraction = (key: string) => {
  let hash = 0x811c9dc5
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0) / 0x100000000
}

// Mirrors the server's draw for a series' first meeting (see rotateTeamHealthQuestionIds): with no
// history every question is tied at zero asks, so each category contributes one question picked
// uniformly at random. Categories keep the order they first appear in, which is the order the
// server builds its stages in.
const drawTeamHealthPreviewQuestions = <Q extends {id: string; category: {id: string}}>(
  questions: ReadonlyArray<Q>,
  seed: number
) => {
  const poolByCategoryId = new Map<string, Q[]>()
  for (const question of questions) {
    const pool = poolByCategoryId.get(question.category.id) ?? []
    pool.push(question)
    poolByCategoryId.set(question.category.id, pool)
  }
  const pools = [...poolByCategoryId.entries()]
  return {
    drawnQuestions: pools.map(
      ([categoryId, pool]) =>
        pool[Math.floor(seededFraction(`${seed}:${categoryId}`) * pool.length)]!
    ),
    largestPoolSize: Math.max(0, ...pools.map(([, pool]) => pool.length))
  }
}

export default drawTeamHealthPreviewQuestions

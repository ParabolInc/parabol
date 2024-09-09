import generateUID, {MAX_SEQ} from '../generateUID'

test('Test overflow', async () => {
  const ids = new Set()
  for (let i = 0; i < MAX_SEQ + 100; i++) {
    const id = generateUID()
    expect(ids.has(id)).toBe(false)
    ids.add(id)
  }
})

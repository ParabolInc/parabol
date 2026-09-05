import shortPromptLabel from '../shortPromptLabel'

it('keeps the first whole words that fit', () => {
  expect(shortPromptLabel('What have you completed recently?')).toBe('What have…')
})

it('drops trailing punctuation from a short question', () => {
  expect(shortPromptLabel('Blockers?')).toBe('Blockers')
})

it('returns the whole question when it fits', () => {
  expect(shortPromptLabel('Today')).toBe('Today')
})

it('cuts mid-word when the first word is too long', () => {
  expect(shortPromptLabel('Sesquipedalian ramblings')).toBe('Sesquipedali…')
})

it('honours a custom max', () => {
  expect(shortPromptLabel('What are you working on today?', 20)).toBe('What are you working…')
})

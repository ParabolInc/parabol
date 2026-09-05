import shortPromptLabel, {shortPromptLabels} from '../shortPromptLabel'

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

describe('shortPromptLabels', () => {
  it('keeps the short labels when they are already distinct', () => {
    expect(
      shortPromptLabels([
        'What have you completed recently?',
        "What's next for you?",
        'What are you stuck on?'
      ])
    ).toEqual(['What have…', "What's next…", 'What are you…'])
  })

  it('widens every label until a shared prefix stops colliding', () => {
    expect(
      shortPromptLabels(['What did you ship yesterday?', 'What did you learn yesterday?'])
    ).toEqual(['What did you ship…', 'What did you learn…'])
  })

  it('falls back to the whole question when no width separates them', () => {
    const question = 'A'.repeat(60)
    expect(shortPromptLabels([`${question} one`, `${question} two`])).toEqual([
      `${question} one`,
      `${question} two`
    ])
  })
})

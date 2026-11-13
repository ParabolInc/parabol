import buildGroupReflectionsPrompt from '../buildGroupReflectionsPrompt'

const crossColumn = {
  meetingName: 'Sprint 12 Retro',
  reflections: [
    {id: 'r1', prompt: 'Glad', text: 'Shipped on time'},
    {id: 'r2', prompt: 'Sad', text: 'Flaky\n  tests'},
    {id: 'r3', prompt: 'Glad', text: 'Great pairing'},
    {id: 'r4', prompt: 'Sad', text: 'CI was slow'},
    {id: 'r5', prompt: 'Mad', text: 'Scope changed mid-sprint'},
    {id: 'r6', prompt: 'Glad', text: 'Demo went well'},
    {id: 'r7', prompt: 'Sad', text: 'Too many meetings'}
  ]
}

test('lists each column together, in the order columns first appear', () => {
  const prompt = buildGroupReflectionsPrompt(crossColumn)
  const ids = [...prompt.matchAll(/^\[(r\d)\]/gm)].map(([, id]) => id)
  expect(ids).toEqual(['r1', 'r3', 'r6', 'r2', 'r4', 'r7', 'r5'])
})

test('puts every card on one line', () => {
  expect(buildGroupReflectionsPrompt(crossColumn)).toContain('[r2] (Sad): Flaky tests\n')
})

test('targets small groups scaled to the board', () => {
  expect(buildGroupReflectionsPrompt(crossColumn)).toContain(
    'Expect roughly 1 to 2 groups that hold 2 or more reflections.'
  )
  const reflections = Array.from({length: 35}, (_, i) => ({id: `r${i}`, text: 'x', prompt: 'Glad'}))
  expect(buildGroupReflectionsPrompt({reflections})).toContain(
    'Expect roughly 6 to 10 groups that hold 2 or more reflections.'
  )
})

test('keeps the meeting name and the rules when a custom prompt replaces the strategy', () => {
  const prompt = buildGroupReflectionsPrompt(crossColumn, 'Group by root cause')
  expect(prompt.startsWith('Group by root cause\n\nMeeting: Sprint 12 Retro\n\n')).toBe(true)
  expect(prompt).not.toContain('How teams group')
  expect(prompt).toContain('Each reflection must belong to exactly one group')
})

test('puts the team briefing after the strategy and before the reflections and rules', () => {
  const prompt = buildGroupReflectionsPrompt(
    crossColumn,
    null,
    '  FMS is the fleet management system.\n'
  )
  const briefing = prompt.indexOf(
    '<team_background>\nFMS is the fleet management system.\n</team_background>'
  )
  expect(briefing).toBeGreaterThan(prompt.indexOf('How teams group'))
  expect(briefing).toBeLessThan(prompt.indexOf('Meeting: Sprint 12 Retro'))
  expect(buildGroupReflectionsPrompt(crossColumn, 'Group by root cause', 'FMS')).toContain(
    '<team_background>\nFMS\n</team_background>'
  )
  expect(buildGroupReflectionsPrompt(crossColumn, null, '  ')).not.toContain('team_background')
})

test('names the question once for a single-column batch', () => {
  const prompt = buildGroupReflectionsPrompt({
    prompt: 'What went well?',
    reflections: [
      {id: 'r1', text: 'Shipped on time'},
      {id: 'r2', text: 'Great pairing'}
    ]
  })
  expect(prompt).toContain('All of these reflections answer the prompt "What went well?"')
  expect(prompt).toContain('[r1]: Shipped on time')
  expect(prompt).not.toContain('Meeting:')
})

import countUnsharedDrafts from '../countUnsharedDrafts'

const doc = (text: string) =>
  JSON.stringify({
    type: 'doc',
    content: [{type: 'paragraph', content: text ? [{type: 'text', text}] : []}]
  })

describe('countUnsharedDrafts', () => {
  it('counts the answers the viewer wrote and has not shared', () => {
    const responses = [
      {userId: 'viewer', sharedAt: null, content: doc('draft')},
      {userId: 'viewer', sharedAt: '2026-09-01T07:00:00.000Z', content: doc('shared')}
    ]
    expect(countUnsharedDrafts(responses, 'viewer')).toBe(1)
  })

  it('ignores a cleared answer and a teammate withdrawing theirs', () => {
    const responses = [
      {userId: 'viewer', sharedAt: null, content: doc('')},
      {userId: 'teammate', sharedAt: null, content: doc('')}
    ]
    expect(countUnsharedDrafts(responses, 'viewer')).toBe(0)
  })
})

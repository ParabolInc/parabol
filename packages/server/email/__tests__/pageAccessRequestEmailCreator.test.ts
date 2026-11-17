import pageAccessRequestEmailCreator from '../pageAccessRequestEmailCreator'

const props = {
  requesterName: 'Ravi Menon',
  requesterEmail: 'ravi@example.com',
  requesterAvatar: 'https://x/a.png',
  reason: null,
  pageLink: 'https://x/pages/7?share=true',
  pageName: 'Escalation path',
  role: 'viewer' as const
}

test('names the synced block in a block request', () => {
  const {subject, body, html} = pageAccessRequestEmailCreator({...props, isSyncedBlock: true})
  expect(subject).toBe('Ravi Menon wants to view a synced block on Parabol')
  expect(body).toContain(
    'Ravi Menon (ravi@example.com) wants to view the synced block Escalation path.'
  )
  expect(html).toContain('requested access to a synced block')
  expect(html).toContain('<b>Escalation path</b>')
})

test('keeps the page wording for a page request', () => {
  const {subject, body} = pageAccessRequestEmailCreator({...props, isSyncedBlock: false})
  expect(subject).toBe('Ravi Menon has requested access to a Page on Parabol')
  expect(body).toContain('has requested to view this page in Parabol: Escalation path')
})

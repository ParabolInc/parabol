import sortInspirationIssues from '../sortInspirationIssues'

const issue = (service: string, updatedAt: string | null) => ({service, updatedAt})

describe('sortInspirationIssues', () => {
  it('groups by service in tile order, newest first within each', () => {
    const sorted = sortInspirationIssues([
      issue('PARABOL', '2026-09-17T10:00:00.000Z'),
      issue('github', '2026-09-23T10:00:00.000Z'),
      issue('gcal', '2026-09-10T10:00:00.000Z'),
      issue('github', '2026-09-29T10:00:00.000Z'),
      issue('PARABOL', '2026-09-20T10:00:00.000Z')
    ])
    expect(sorted.map(({service, updatedAt}) => `${service} ${updatedAt?.slice(5, 10)}`)).toEqual([
      'PARABOL 09-20',
      'PARABOL 09-17',
      'github 09-29',
      'github 09-23',
      'gcal 09-10'
    ])
  })

  it('puts issues without a date last in their service', () => {
    const sorted = sortInspirationIssues([
      issue('jira', null),
      issue('jira', '2026-09-23T10:00:00.000Z')
    ])
    expect(sorted.map(({updatedAt}) => updatedAt)).toEqual(['2026-09-23T10:00:00.000Z', null])
  })
})

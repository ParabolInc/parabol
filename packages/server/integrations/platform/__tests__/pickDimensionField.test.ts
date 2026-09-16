import type {IntegrationDimensionFieldMap} from '../../../postgres/types'
import pickDimensionField from '../pickDimensionField'

const row = (
  issueType: string | null,
  fieldId: string,
  updatedAt: string
): IntegrationDimensionFieldMap => ({
  id: 1,
  teamId: 't',
  service: 'jira',
  repoId: 'c:P',
  issueType,
  dimensionName: 'Effort',
  fieldId,
  fieldName: null,
  fieldType: 'number',
  updatedAt: new Date(updatedAt)
})

const rows = [
  row('Bug', 'customfield_2', '2026-03-01'),
  row('Story', 'customfield_1', '2026-02-01'),
  row(null, 'customfield_9', '2026-01-01')
]

describe('pickDimensionField', () => {
  it('prefers the exact issue type', () => {
    expect(pickDimensionField(rows, {repoId: 'c:P', issueType: 'Story'})?.fieldId).toBe(
      'customfield_1'
    )
  })

  it('without usableFieldIds only an exact type matches', () => {
    expect(pickDimensionField(rows, {repoId: 'c:P', issueType: 'Task'})).toBeNull()
  })

  it('matches a null issueType row for services without issue types', () => {
    const labelRows = [row(null, 'Effort: {value}', '2026-01-01')]
    expect(pickDimensionField(labelRows, {repoId: 'c:P', issueType: null})?.fieldId).toBe(
      'Effort: {value}'
    )
  })

  it('with usableFieldIds an exact row targeting a field the issue lacks is skipped in favour of a usable fallback', () => {
    const picked = pickDimensionField(rows, {
      repoId: 'c:P',
      issueType: 'Story',
      usableFieldIds: ['customfield_2']
    })
    expect(picked?.issueType).toBe('Bug')
  })

  it('with usableFieldIds an unmapped type falls back to the newest usable row', () => {
    const picked = pickDimensionField(rows, {
      repoId: 'c:P',
      issueType: 'Task',
      usableFieldIds: ['customfield_1', 'customfield_9']
    })
    expect(picked?.fieldId).toBe('customfield_1')
  })

  it('sentinel rows are always usable', () => {
    const picked = pickDimensionField([row('Task', '__comment', '2026-01-01')], {
      repoId: 'c:P',
      issueType: 'Task',
      usableFieldIds: []
    })
    expect(picked?.fieldId).toBe('__comment')
  })
})

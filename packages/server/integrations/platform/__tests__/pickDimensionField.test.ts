import type {IntegrationDimensionFieldMap} from '../../../postgres/types'
import pickDimensionField from '../pickDimensionField'

const row = (
  workItemType: string,
  fieldId: string,
  updatedAt: string
): IntegrationDimensionFieldMap => ({
  id: 1,
  teamId: 't',
  service: 'jira',
  repoId: 'c:P',
  workItemType,
  dimensionName: 'Effort',
  fieldId,
  fieldName: fieldId,
  fieldType: 'number',
  updatedAt: new Date(updatedAt)
})

const rows = [
  row('Bug', 'customfield_2', '2026-03-01'),
  row('Story', 'customfield_1', '2026-02-01'),
  row('', 'customfield_9', '2026-01-01')
]

describe('pickDimensionField', () => {
  it('prefers the exact work item type', () => {
    expect(pickDimensionField(rows, {repoId: 'c:P', workItemType: 'Story'})?.fieldId).toBe(
      'customfield_1'
    )
  })

  it('without usableFieldIds only an exact type matches', () => {
    expect(pickDimensionField(rows, {repoId: 'c:P', workItemType: 'Task'})).toBeNull()
  })

  it('with usableFieldIds an exact row targeting a field the issue lacks is skipped in favour of a usable fallback', () => {
    const picked = pickDimensionField(rows, {
      repoId: 'c:P',
      workItemType: 'Story',
      usableFieldIds: ['customfield_2']
    })
    expect(picked?.workItemType).toBe('Bug')
  })

  it('with usableFieldIds an unmapped type falls back to the newest usable row', () => {
    const picked = pickDimensionField(rows, {
      repoId: 'c:P',
      workItemType: 'Task',
      usableFieldIds: ['customfield_1', 'customfield_9']
    })
    expect(picked?.fieldId).toBe('customfield_1')
  })

  it('sentinel rows are always usable', () => {
    const picked = pickDimensionField([row('Task', '__comment', '2026-01-01')], {
      repoId: 'c:P',
      workItemType: 'Task',
      usableFieldIds: []
    })
    expect(picked?.fieldId).toBe('__comment')
  })
})

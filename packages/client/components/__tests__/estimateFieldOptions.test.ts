import {SprintPokerDefaults} from '../../types/constEnums'
import {
  findEstimateFieldOption,
  isFieldTemplate,
  resolveEstimateFieldLabel
} from '../estimateFieldOptions'

const options = [
  {fieldId: 'customfield_1', label: 'Story Points'},
  {fieldId: '__storyPoints', label: 'Story point estimate'}
]
const fieldTargets = ['comment', 'field']

describe('findEstimateFieldOption', () => {
  it('matches by fieldId or by label (Jira stores the name, Azure the sentinel)', () => {
    expect(findEstimateFieldOption(options, 'Story Points')?.fieldId).toBe('customfield_1')
    expect(findEstimateFieldOption(options, '__storyPoints')?.label).toBe('Story point estimate')
    expect(findEstimateFieldOption(options, 'Retired')).toBeUndefined()
  })
})

describe('resolveEstimateFieldLabel', () => {
  it('names the two sentinels', () => {
    expect(
      resolveEstimateFieldLabel({
        name: SprintPokerDefaults.SERVICE_FIELD_COMMENT,
        options,
        targets: fieldTargets,
        finalScore: '3'
      })
    ).toBe(SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL)
    expect(
      resolveEstimateFieldLabel({
        name: SprintPokerDefaults.SERVICE_FIELD_NULL,
        options,
        targets: fieldTargets,
        finalScore: '3'
      })
    ).toBe(SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL)
  })

  it('uses the matching option label', () => {
    expect(
      resolveEstimateFieldLabel({
        name: 'Story Points',
        options,
        targets: fieldTargets,
        finalScore: null
      })
    ).toBe('Story Points')
    expect(
      resolveEstimateFieldLabel({
        name: '__storyPoints',
        options,
        targets: fieldTargets,
        finalScore: null
      })
    ).toBe('Story point estimate')
  })

  it('interpolates a label template for label services', () => {
    expect(
      resolveEstimateFieldLabel({
        name: 'Points: {{#}}',
        options: [],
        targets: ['comment', 'label'],
        finalScore: '5'
      })
    ).toBe('Points: 5')
  })

  it('falls back to the raw name for a field the service no longer lists', () => {
    expect(
      resolveEstimateFieldLabel({name: 'Retired', options, targets: fieldTargets, finalScore: null})
    ).toBe('Retired')
  })

  it('names a static field id even when the service lists no options', () => {
    expect(
      resolveEstimateFieldLabel({
        name: SprintPokerDefaults.GITLAB_FIELD_WEIGHT,
        options: [],
        targets: ['comment', 'label'],
        finalScore: '3'
      })
    ).toBe('Weight')
    expect(
      resolveEstimateFieldLabel({
        name: SprintPokerDefaults.AZURE_DEVOPS_USERSTORY_FIELD,
        options: [],
        targets: fieldTargets,
        finalScore: null
      })
    ).toBe('Story point estimate')
  })
})

describe('isFieldTemplate', () => {
  it('is false for a static field id', () => {
    expect(isFieldTemplate(SprintPokerDefaults.GITLAB_FIELD_WEIGHT)).toBe(false)
  })

  it('is false for a sentinel', () => {
    expect(isFieldTemplate(SprintPokerDefaults.SERVICE_FIELD_COMMENT)).toBe(false)
  })

  it('is true for a facilitator-authored label template', () => {
    expect(isFieldTemplate('Points: {{#}}')).toBe(true)
  })
})

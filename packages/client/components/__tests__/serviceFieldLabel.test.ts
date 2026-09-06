import {SprintPokerDefaults} from '../../types/constEnums'
import {isLabelTemplate, resolveServiceFieldLabel} from '../serviceFieldLabel'

const fieldListing = {
  targets: ['comment', 'field'],
  options: [{fieldId: 'customfield_1'}, {fieldId: '__storyPoints'}]
}
const labelListing = {targets: ['comment', 'label'], options: [{fieldId: '__weight'}]}

describe('isLabelTemplate', () => {
  it('is false for sentinels and listed fields even on a label service', () => {
    expect(
      isLabelTemplate({fieldId: SprintPokerDefaults.SERVICE_FIELD_COMMENT}, labelListing)
    ).toBe(false)
    expect(isLabelTemplate({fieldId: SprintPokerDefaults.SERVICE_FIELD_NULL}, labelListing)).toBe(
      false
    )
    expect(isLabelTemplate({fieldId: '__weight'}, labelListing)).toBe(false)
  })

  it('is true for an unlisted id on a label service only', () => {
    expect(isLabelTemplate({fieldId: 'Points: {{#}}'}, labelListing)).toBe(true)
    expect(isLabelTemplate({fieldId: 'Points: {{#}}'}, fieldListing)).toBe(false)
  })
})

describe('resolveServiceFieldLabel', () => {
  it('shows the server label for sentinels and fields', () => {
    const comment = {
      fieldId: SprintPokerDefaults.SERVICE_FIELD_COMMENT,
      label: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL
    }
    expect(resolveServiceFieldLabel(comment, fieldListing, '3')).toBe('As Comment')
    expect(
      resolveServiceFieldLabel({fieldId: 'customfield_1', label: 'Story Points'}, fieldListing, '3')
    ).toBe('Story Points')
  })

  it('does not interpolate a sentinel on a label service', () => {
    const doNotUpdate = {
      fieldId: SprintPokerDefaults.SERVICE_FIELD_NULL,
      label: SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL
    }
    expect(resolveServiceFieldLabel(doNotUpdate, labelListing, '3')).toBe('Do Not Update')
  })

  it('shows a field service id verbatim when the service no longer lists it', () => {
    expect(
      resolveServiceFieldLabel(
        {fieldId: 'customfield_9', label: 'customfield_9'},
        fieldListing,
        '3'
      )
    ).toBe('customfield_9')
  })

  it('interpolates a label template with the final score', () => {
    const template = {fieldId: 'Points: {{#}}', label: 'Points: {{#}}'}
    expect(resolveServiceFieldLabel(template, labelListing, '5')).toBe('Points: 5')
    expect(resolveServiceFieldLabel(template, labelListing, null)).toBe('Points: #')
  })
})
